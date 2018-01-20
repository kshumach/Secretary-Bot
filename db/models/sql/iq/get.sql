/*
    SQL for retrieving a user's iq
*/

SELECT iq
FROM iq_points
WHERE user_id = $1
AND server_id = $2