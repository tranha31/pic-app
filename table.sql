-- 
-- Set character set the client will use to send SQL statements to the server
--
SET NAMES 'utf8';

--
-- Set default database
--
USE pic_bin_db;

--
-- Create table `copyrightimage`
--
CREATE TABLE copyrightimage (
  ImageID varchar(36) NOT NULL,
  UserPublicKey varchar(45) NOT NULL,
  Caption text DEFAULT NULL,
  CreatedDate datetime DEFAULT CURRENT_TIMESTAMP,
  ModifiedDate datetime DEFAULT CURRENT_TIMESTAMP,
  Status int DEFAULT 0,
  PRIMARY KEY (ImageID)
)
ENGINE = INNODB,
AVG_ROW_LENGTH = 2048,
CHARACTER SET utf8mb3,
COLLATE utf8mb3_general_ci;

--
-- Create table `marketitem`
--
CREATE TABLE marketitem (
  ID varchar(36) DEFAULT NULL,
  ImageID varchar(36) DEFAULT NULL,
  UserPublicKey varchar(255) DEFAULT NULL,
  Caption varchar(500) DEFAULT NULL,
  Detail text DEFAULT NULL,
  Price decimal(10, 10) DEFAULT NULL,
  CreatedDate datetime DEFAULT CURRENT_TIMESTAMP,
  ModifiedDate datetime DEFAULT CURRENT_TIMESTAMP
)
ENGINE = INNODB,
AVG_ROW_LENGTH = 8192,
CHARACTER SET utf8mb3,
COLLATE utf8mb3_general_ci;

--
-- Create index `Caption` on table `marketitem`
--
ALTER TABLE marketitem
ADD FULLTEXT INDEX Caption (Caption);

--
-- Create index `Detail` on table `marketitem`
--
ALTER TABLE marketitem
ADD FULLTEXT INDEX Detail (Detail);

--
-- Create foreign key
--
ALTER TABLE marketitem
ADD CONSTRAINT FK_marketitem_copyrightimage FOREIGN KEY (ImageID)
REFERENCES copyrightimage (ImageID);

--
-- Create table `auctionroom`
--
CREATE TABLE auctionroom (
  ID varchar(36) NOT NULL DEFAULT '',
  ImageID varchar(36) NOT NULL DEFAULT '',
  OwnerPublicKey varchar(255) DEFAULT NULL,
  StartTime datetime DEFAULT NULL,
  EndTime datetime DEFAULT NULL,
  HighestPrice decimal(10, 10) DEFAULT 0.0000000000,
  HighestBeter varchar(255) DEFAULT NULL,
  StartPrice decimal(10, 10) DEFAULT 0.0000000000,
  Status int DEFAULT 0,
  PRIMARY KEY (ID)
)
ENGINE = INNODB,
AVG_ROW_LENGTH = 16384,
CHARACTER SET utf8mb3,
COLLATE utf8mb3_general_ci;

--
-- Create foreign key
--
ALTER TABLE auctionroom
ADD CONSTRAINT FK_auctionroom_ImageID FOREIGN KEY (ImageID)
REFERENCES copyrightimage (ImageID);

--
-- Create table `auctionjoin`
--
CREATE TABLE auctionjoin (
  ID varchar(36) NOT NULL DEFAULT '',
  AuctionRoomID varchar(36) DEFAULT NULL,
  UserPublicKey varchar(255) DEFAULT NULL,
  PRIMARY KEY (ID)
)
ENGINE = INNODB,
CHARACTER SET utf8mb3,
COLLATE utf8mb3_general_ci;

--
-- Create foreign key
--
ALTER TABLE auctionjoin
ADD CONSTRAINT FK_auctionjoin_AuctionRoomID FOREIGN KEY (AuctionRoomID)
REFERENCES auctionroom (ID);

--
-- Create table `auctionhistory`
--
CREATE TABLE auctionhistory (
  ID varchar(36) NOT NULL DEFAULT '',
  AuctionRoomID varchar(36) DEFAULT NULL,
  UserPublicKey varchar(255) DEFAULT NULL,
  Price decimal(10, 10) DEFAULT 0.0000000000,
  CreatedTime datetime DEFAULT NULL,
  Action int DEFAULT NULL,
  PRIMARY KEY (ID)
)
ENGINE = INNODB,
CHARACTER SET utf8mb3,
COLLATE utf8mb3_general_ci;

--
-- Create foreign key
--
ALTER TABLE auctionhistory
ADD CONSTRAINT FK_auctiondetail_AuctionRoomID FOREIGN KEY (AuctionRoomID)
REFERENCES auctionroom (ID);

--
-- Create table `registerreject`
--
CREATE TABLE registerreject (
  RefID varchar(36) DEFAULT NULL,
  ImageSimilar longtext DEFAULT NULL,
  ReasonReject varchar(255) DEFAULT NULL
)
ENGINE = INNODB,
AVG_ROW_LENGTH = 8192,
CHARACTER SET utf8mb3,
COLLATE utf8mb3_general_ci;

--
-- Create table `log`
--
CREATE TABLE log (
  RefID varchar(36) DEFAULT NULL,
  Message text DEFAULT NULL,
  StackTrace longtext DEFAULT NULL,
  CreatedDate datetime DEFAULT NULL
)
ENGINE = INNODB,
AVG_ROW_LENGTH = 2340,
CHARACTER SET utf8mb3,
COLLATE utf8mb3_general_ci;

--
-- Create table `copyrightsignature`
--
CREATE TABLE copyrightsignature (
  RefID varchar(36) NOT NULL,
  UserPublicKey varchar(45) NOT NULL,
  CreatedDate datetime DEFAULT NULL,
  NumberImage int NOT NULL,
  PRIMARY KEY (RefID)
)
ENGINE = INNODB,
AVG_ROW_LENGTH = 5461,
CHARACTER SET utf8mb3,
COLLATE utf8mb3_general_ci;