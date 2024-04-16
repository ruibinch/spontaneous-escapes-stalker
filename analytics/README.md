# Analytics

Powered by Umami - https://umami-tawny-phi.vercel.app/

## Tables

### `event_data`

| Name             | Type          | Nullable? | Description                               |
| ---------------- | ------------- | --------- | ----------------------------------------- |
| event_data_id    | uuid          | NO        | Unique UUID                               |
| website_id       | uuid          | NO        | `72c90a3b-768b-4f5e-af4e-87b45cb0d3ce`    |
| website_event_id | uuid          | NO        | FK to `event_id` in `website_event` table |
| event_key        | varchar(500)  | NO        |                                           |
| string_value     | varchar(500)  | YES       |                                           |
| number_value     | numeric(19,4) | YES       | All `NULL`                                |
| date_value       | timestamptz   | YES       | All `NULL`                                |
| data_type        | int4          | NO        | `1`                                       |
| created_at       | timestamptz   | YES       |                                           |

### `session`

| Name         | Type         | Nullable? | Description                            |
| ------------ | ------------ | --------- | -------------------------------------- |
| session_id   | uuid         | NO        | Unique UUID                            |
| website_id   | uuid         | NO        | `72c90a3b-768b-4f5e-af4e-87b45cb0d3ce` |
| hostname     | varchar(100) | YES       | `www.kfseanalysis.com`                 |
| browser      | varchar(20)  | YES       |                                        |
| os           | varchar(20)  | YES       |                                        |
| device       | varchar(20)  | YES       |                                        |
| screen       | varchar(11)  | YES       |                                        |
| language     | varchar(35)  | YES       |                                        |
| country      | bpchar(2)    | YES       | 2-letter country code                  |
| subdivision1 | varchar(20)  | YES       | Country breakdown 1                    |
| subdivision2 | varchar(50)  | YES       | Country breakdown 2                    |
| city         | varchar(50)  | YES       | City name                              |
| created_at   | timestamptz  | YES       |                                        |

### `website`

```csv
website_id,name,domain,share_id,reset_at,user_id,created_at,updated_at,deleted_at,created_by,team_id
72c90a3b-768b-4f5e-af4e-87b45cb0d3ce,KFSEAnalysis,www.kfseanalysis.com,NULL,NULL,41e2b680-648e-4b09-bcd7-3e2b10c06264,2024-04-14 15:10:06.62+00,2024-04-14 15:10:06.62+00,NULL,41e2b680-648e-4b09-bcd7-3e2b10c06264,NULL
```

### `website_event`

| Name            | Type         | Nullable? | Description                                               |
| --------------- | ------------ | --------- | --------------------------------------------------------- |
| event_id        | uuid         | NO        | Unique UUID                                               |
| website_id      | uuid         | NO        | `72c90a3b-768b-4f5e-af4e-87b45cb0d3ce`                    |
| session_id      | uuid         | NO        | FK to `session_id` in `session`                           |
| created_at      | timestamptz  | YES       |                                                           |
| url_path        | varchar(500) | NO        |                                                           |
| url_query       | varchar(500) | YES       | All `NULL`                                                |
| referrer_path   | varchar(500) | YES       | From path                                                 |
| referrer_query  | varchar(500) | YES       | All `NULL`                                                |
| referrer_domain | varchar(500) | YES       | Not important                                             |
| page_title      | varchar(500) | YES       | Not important                                             |
| event_type      | int4         | NO        | `1` for path-based event; `2` for interaction-based event |
| event_name      | varchar(50)  | YES       |                                                           |
| visit_id        | uuid         | NO        |                                                           |
