/*
   Gets the emojis specified by the IN clause
*/

SELECT * FROM emojis
WHERE emoji IN ($1:csv)
AND server_id = $2