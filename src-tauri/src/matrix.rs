use matrix_sdk::{
    ruma::UserId,
    Client,
    matrix_auth::{MatrixSession, MatrixSessionTokens},
    SessionMeta,
    config::SyncSettings,
};
use tokio::sync::Mutex;
use tauri::{State, AppHandle, Emitter};
use serde::{Deserialize, Serialize};
use futures_util::StreamExt;

pub struct MatrixState {
    pub client: Mutex<Option<Client>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct MatrixEventPayload {
    pub room_id: String,
    pub event_type: String,
    pub sender: String,
    pub body: String,
    pub event_id: String,
}

#[tauri::command]
pub async fn start_sync(
    app_handle: AppHandle,
    state: State<'_, MatrixState>,
) -> Result<(), String> {
    let client = {
        let client_lock = state.client.lock().await;
        client_lock.as_ref().cloned().ok_or("Client not initialized")?
    };

    tokio::spawn(async move {
        let sync_settings = SyncSettings::default();
        let mut sync_stream = Box::pin(client.sync_stream(sync_settings).await);

        while let Some(Ok(response)) = sync_stream.next().await {
            for (room_id, room) in response.rooms.join {
                for _event in room.timeline.events {
                    // v0.8.0 SyncTimelineEvent has a `kind` field which is TimelineEventKind
                    // For now, let's just log that an event was received
                    // We'll add detailed deserialization once the basics work
                    let _ = app_handle.emit("matrix-event", MatrixEventPayload {
                        room_id: room_id.to_string(),
                        event_type: "m.room.message".to_string(), // Placeholder
                        sender: "unknown".to_string(), // Placeholder
                        body: "New message received".to_string(),
                        event_id: "unknown".to_string(), // Placeholder
                    });
                }
            }
        }
    });

    Ok(())
}

#[derive(Serialize, Deserialize)]
pub struct LoginResponse {
    pub user_id: String,
    pub device_id: String,
    pub access_token: String,
    pub homeserver: String,
}

#[tauri::command]
pub async fn login(
    homeserver: String,
    username: String,
    password: String,
    state: State<'_, MatrixState>,
) -> Result<LoginResponse, String> {
    let client = Client::builder()
        .homeserver_url(&homeserver)
        .sqlite_store("matrix.db", None)
        .build()
        .await
        .map_err(|e| e.to_string())?;

    let response = client
        .matrix_auth()
        .login_username(&username, &password)
        .initial_device_display_name("Reach Desktop (Rust)")
        .await
        .map_err(|e| e.to_string())?;

    let mut client_lock = state.client.lock().await;
    *client_lock = Some(client.clone());

    Ok(LoginResponse {
        user_id: response.user_id.to_string(),
        device_id: response.device_id.to_string(),
        access_token: response.access_token,
        homeserver,
    })
}

#[tauri::command]
pub async fn logout(state: State<'_, MatrixState>) -> Result<(), String> {
    let mut client_lock = state.client.lock().await;
    if let Some(client) = client_lock.take() {
        client.matrix_auth().logout().await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn reconnect(
    homeserver: String,
    user_id: String,
    access_token: String,
    device_id: String,
    state: State<'_, MatrixState>,
) -> Result<(), String> {
    let user_id = UserId::parse(&user_id).map_err(|e| e.to_string())?;
    
    let client = Client::builder()
        .homeserver_url(&homeserver)
        .sqlite_store("matrix.db", None)
        .build()
        .await
        .map_err(|e| e.to_string())?;

    client.restore_session(MatrixSession {
        meta: SessionMeta {
            user_id,
            device_id: device_id.into(),
        },
        tokens: MatrixSessionTokens {
            access_token,
            refresh_token: None,
        },
    }).await.map_err(|e| e.to_string())?;

    let mut client_lock = state.client.lock().await;
    *client_lock = Some(client);

    Ok(())
}
