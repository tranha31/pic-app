-- 
-- Set character set the client will use to send SQL statements to the server
--
SET NAMES 'utf8';

--
-- Set default database
--
USE pic_bin_db;

DELIMITER $$

--
-- Create procedure `Proc_MarketItem_Update`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_MarketItem_Update (IN ImageID varchar(36), IN `Key` varchar(255), IN Caption varchar(500), IN Detail text, IN Price decimal(10, 10), IN Mode int, IN ID varchar(36))
BEGIN

  IF Mode = 0 THEN
    INSERT INTO marketitem
      VALUE (ID, ImageID, `Key`, Caption, Detail, Price, DATE_ADD(NOW(), INTERVAL 7 HOUR), DATE_ADD(NOW(), INTERVAL 7 HOUR));
  ELSE
    UPDATE marketitem m
    SET m.Caption = Caption,
        m.Detail = Detail,
        m.Price = Price,
        m.ModifiedDate = DATE_ADD(NOW(), INTERVAL 7 HOUR)
    WHERE m.ID = ID;
  END IF;

  UPDATE copyrightimage c
  SET c.Status = 1
  WHERE c.ImageID = ImageID;
END
$$

--
-- Create procedure `Proc_MarketItem_GetListPagingForHome`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_MarketItem_GetListPagingForHome (IN PublicKey varchar(255), IN FromDate datetime, IN ToDate datetime, IN Start int, IN Length int)
BEGIN
  SELECT
    *
  FROM marketitem m
  WHERE m.UserPublicKey <> PublicKey
  AND (m.CreatedDate BETWEEN FromDate AND ToDate)
  ORDER BY m.ModifiedDate LIMIT Start, Length;
END
$$

--
-- Create procedure `Proc_MarketItem_GetListPaging`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_MarketItem_GetListPaging (IN PublicKey varchar(255), IN FromDate datetime, IN ToDate datetime, IN Start int, IN Length int)
BEGIN
  SELECT
    *
  FROM marketitem m
  WHERE m.UserPublicKey = PublicKey
  AND (m.CreatedDate BETWEEN FromDate AND ToDate)
  ORDER BY m.ModifiedDate LIMIT Start, Length;
END
$$

--
-- Create procedure `Proc_MarketItem_Delete`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_MarketItem_Delete (IN ItemID varchar(36))
BEGIN
  UPDATE copyrightimage c
  SET c.Status = 0
  WHERE c.ImageID = (SELECT
      m.ImageID
    FROM marketitem m
    WHERE m.ID = ItemID);

  DELETE
    FROM marketitem
  WHERE ID = ItemID;
END
$$

--
-- Create procedure `Proc_ListImage_Paging`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_ListImage_Paging (IN `Key` varchar(255), IN Start int, IN Length int, IN FromDate datetime, IN ToDate datetime, IN Status int)
BEGIN
  IF Status = -1 THEN
    SELECT
      *
    FROM copyrightimage c
    WHERE c.UserPublicKey = `Key`
    AND (c.CreatedDate BETWEEN FromDate AND ToDate)
    ORDER BY c.CreatedDate LIMIT Start, Length;
  ELSE
    SELECT
      *
    FROM copyrightimage c
    WHERE c.UserPublicKey = `Key`
    AND (c.CreatedDate BETWEEN FromDate AND ToDate)
    AND c.Status = Status
    ORDER BY c.CreatedDate LIMIT Start, Length;
  END IF;
END
$$

--
-- Create procedure `Proc_InsertLog`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_InsertLog (IN Message text, IN StackTrace text)
BEGIN
  INSERT INTO log
    VALUE (UUID(), Message, StackTrace, DATE_ADD(NOW(), INTERVAL 7 HOUR));
END
$$

--
-- Create procedure `Proc_CopyrightImage_Update`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_CopyrightImage_Update (IN ImageID varchar(36), IN NeKey varchar(255), IN OldKey varchar(255), IN SellID varchar(36))
BEGIN
  DELETE
    FROM marketitem
  WHERE ID = SellID;

  UPDATE copyrightimage c
  SET c.UserPublicKey = NeKey,
      c.ModifiedDate = DATE_ADD(NOW(), INTERVAL 7 HOUR),
      c.Status = 0
  WHERE c.ImageID = ImageID;

  UPDATE copyrightsignature c
  SET c.NumberImage = c.NumberImage - 1
  WHERE c.UserPublicKey = OldKey;

  IF EXISTS (SELECT
        c.RefID
      FROM copyrightsignature c
      WHERE c.UserPublicKey = NeKey) THEN
    UPDATE copyrightsignature c
    SET c.NumberImage = c.NumberImage + 1
    WHERE c.UserPublicKey = NeKey;
  ELSE
    INSERT INTO copyrightsignature
      VALUE (UUID(), NeKey, DATE_ADD(NOW(), INTERVAL 7 HOUR), 1);
  END IF;

END
$$

--
-- Create procedure `Proc_AuctionRoom_Update`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_AuctionRoom_Update (IN Mode int, IN ImageID varchar(36), IN `Key` varchar(255), IN FromDate datetime, IN ToDate datetime, IN Price decimal(10, 10), IN ItemID varchar(36))
BEGIN
  IF Mode = 0 THEN
    INSERT INTO auctionroom
      VALUE (ItemID, ImageID, `Key`, FromDate, ToDate, 0, NULL, Price, 0);

    UPDATE copyrightimage c
    SET c.Status = 2
    WHERE c.ImageID = ImageID;
  ELSE
    UPDATE auctionroom a
    SET a.StartTime = FromDate,
        a.EndTime = ToDate,
        a.StartPrice = Price
    WHERE a.ID = ItemID;
  END IF;
END
$$

--
-- Create procedure `Proc_AuctionRoom_Delete`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_AuctionRoom_Delete (IN ItemID varchar(36))
BEGIN
  UPDATE copyrightimage c
  SET c.Status = 0
  WHERE c.ImageID = (SELECT
      m.ImageID
    FROM auctionroom m
    WHERE m.ID = ItemID);

  DELETE
    FROM auctionhistory
  WHERE AuctionRoomID = ItemID;

  DELETE
    FROM auctionjoin
  WHERE AuctionRoomID = ItemID;

  DELETE
    FROM auctionroom
  WHERE ID = ItemID;
END
$$

--
-- Create procedure `Proc_AuctionRoom_AddHistory`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_AuctionRoom_AddHistory (IN RoomID varchar(36), IN `Key` varchar(255), IN Price decimal(10, 10), IN Action int)
BEGIN
  INSERT INTO auctionhistory
    VALUE (UUID(), RoomID, `Key`, Price, DATE_ADD(NOW(), INTERVAL 7 HOUR), Action);

  IF Action = 0 THEN
    INSERT INTO auctionjoin
      VALUE (UUID(), RoomID, `Key`);

    SET @HighestPrice = (SELECT
        SUM(a.Price)
      FROM auctionhistory a
      WHERE a.AuctionRoomID = RoomID
      AND a.UserPublicKey = `Key`
      AND a.Action = 0);

    UPDATE auctionroom a
    SET a.HighestPrice = @HighestPrice,
        a.HighestBeter = `Key`
    WHERE a.ID = RoomID;

  ELSE
    DELETE
      FROM auctionjoin
    WHERE UserPublicKey = `Key`
      AND AuctionRoomID = RoomID;
  END IF;
END
$$

--
-- Create procedure `Proc_AddNew_RequestReject`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_AddNew_RequestReject (IN RefID varchar(36), IN ImageID longtext, IN Reason varchar(255))
BEGIN
  INSERT INTO registerreject (RefID, ImageSimilar, ReasonReject)
    VALUE (RefID, ImageID, Reason);
END
$$

--
-- Create procedure `Proc_AddNewImage`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_AddNewImage (IN Sign varchar(45), IN Caption text, OUT ID varchar(36))
BEGIN
  SET ID = UUID();

  INSERT INTO copyrightimage
    VALUE (ID, Sign, Caption, DATE_ADD(NOW(), INTERVAL 7 HOUR), DATE_ADD(NOW(), INTERVAL 7 HOUR), 0);

  SET @ExistSign = (SELECT
      1
    FROM copyrightsignature c
    WHERE c.UserPublicKey = Sign);

  IF @ExistSign = 1 THEN
    UPDATE copyrightsignature c
    SET c.NumberImage = c.NumberImage + 1
    WHERE c.UserPublicKey = Sign;
  ELSE
    INSERT INTO copyrightsignature
      VALUE (UUID(), Sign, DATE_ADD(NOW(), INTERVAL 7 HOUR), 1);
  END IF;

END
$$

--
-- Create procedure `Proc_Notification_Insert`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_Notification_Insert (IN UserKey varchar(255), IN Content varchar(500), IN Type int, IN ReferenceLink varchar(500), IN ImageID varchar(36))
BEGIN
  INSERT INTO notification
    VALUES (UUID(), UserKey, Content, 0, Type, ReferenceLink, DATE_ADD(NOW(), INTERVAL 7 HOUR), ImageID);
END
$$

--
-- Create procedure `Proc_Notification_Get`
--
CREATE DEFINER = 'root'@'localhost'
PROCEDURE Proc_Notification_Get (IN UserKey varchar(255))
BEGIN
  SELECT
    *
  FROM notification n
  WHERE n.UserPublicKey = UserKey
  AND n.Status = 0;
END
$$

DELIMITER ;