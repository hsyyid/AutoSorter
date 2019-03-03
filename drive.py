from googleapiclient.discovery import build
from oauth2client.client import AccessTokenCredentials


def get_text(access_token, file_ids):
    text = []

    creds = AccessTokenCredentials(access_token, 'my-user-agent/1.0')
    drive_service = build('drive', 'v3', credentials=creds)

    def callback(request_id, response, exception):
        if exception:
            # Handle error
            print(exception)
        else:
            print(response)
            text.append(response.decode('utf-8'))

    batch = drive_service.new_batch_http_request(callback=callback)

    for file_id in file_ids:
        batch.add(drive_service.files().export(
            fileId=file_id,
            mimeType="text/plain",
            fields='id',
        ))
    pass

    batch.execute()

    return text


def copy_files(access_token, file_ids, folder_ids, labels):
    def copy_callback(request_id, response, exception):
        if exception:
            print(exception)
        else:
            print(response)

    creds = AccessTokenCredentials(access_token, 'my-user-agent/1.0')
    drive_service = build('drive', 'v3', credentials=creds)

    move_files = drive_service.new_batch_http_request(callback=copy_callback)

    for label, id in zip(labels, file_ids):
        move_files.add(
            drive_service.files().copy(fileId=id, body={"parents": [folder_ids[label]]})
        )

    move_files.execute()
