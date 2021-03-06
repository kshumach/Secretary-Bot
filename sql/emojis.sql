CREATE TABLE IF NOT EXISTS emojis (
    emoji varchar(255),
    server_id varchar(50),
    usage_count INT,
    PRIMARY KEY (emoji, server_id)
);

CREATE TABLE IF NOT EXISTS emoji_usage (
      emoji varchar(255),
      server_id varchar(50),
      user_id varchar(50),
      use_date timestamp without time zone DEFAULT LOCALTIMESTAMP(3)
);