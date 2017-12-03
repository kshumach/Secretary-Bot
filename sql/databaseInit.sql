CREATE TABLE iq_points (
    user_id VARCHAR(50),
    server_id VARCHAR(50),
    IQ INT DEFAULT 120,
    PRIMARY KEY (user_id, server_id)
);

CREATE TABLE iq_points_alterations (
    target_user VARCHAR(50),
    trigger_user VARCHAR(50),
    change_type INT,
    change_amount INT,
    reason VARCHAR(250),
    alteration_date date default CURRENT_DATE
);