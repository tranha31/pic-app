from math import sqrt, cos, pi, floor
import numpy as np
from PIL import Image as im
import io
import base64
from .imagecaptionbl import ImageCaptionBL
from .imagesimilarbl import ImageSimilarBL
from repositories.dlcopyright import DLCopyright

class CopyrightBL:

    K = 5
    Y = 0
    Cb = 1
    Cr = 2
    oImageCaptionBL = None
    oImageSimilarBL = None
    oDL = None

    def __init__(self) -> None:
        self.oImageCaptionBL = ImageCaptionBL()
        self.oImageSimilarBL = ImageSimilarBL()
        self.oDL = DLCopyright()
        pass
    
    """
    Kiểm tra ảnh có phải là ảnh đa mức xám không
    (24/4/2023)
    """
    def isGreyScale(self, img):
        img = img.convert('RGB')
        w, h = img.size
        for i in range(w):
            for j in range(h):
                r, g, b = img.getpixel((i,j))
                if r != g != b: 
                    return False
        return True

    '''
    Convert từ chuỗi base64 string sang mảng điểm ảnh
    (11/4/2023)
    '''
    def inputImage(self, base64_string):
        imgdata = base64.b64decode(base64_string)
        image = im.open(io.BytesIO(imgdata))

        checkGrey = self.isGreyScale(image)
        if checkGrey:
            return False

        ycbcr = image.convert('YCbCr')

        YCbCr = list(ycbcr.getdata())  # flat list of tuples
        # reshape
        imYCbCr = np.reshape(YCbCr, (image.size[1], image.size[0], 3))
        # Convert 32-bit elements to 8-bit
        imYCbCr = imYCbCr.astype(np.uint8)
        return imYCbCr
    
    '''
    Convert string sang bit. 1 chữ => 7 bit
    (11/4/2023)
    '''
    def hexToBinary(self, string):
        binary = ''
        for x in string:
            bit = format(ord(x), 'b')
            if len(bit) < 7:
                padding = 7 - len(bit)
                for i in range(padding):
                    bit = "0" + bit
            binary = binary + bit
        return binary
    
    
    '''
    Tính giá trị C
    (11/4/2023)
    '''
    def C(self, u):
        if u == 0:
            return 1 / sqrt(2)
        else:
            return 1

    '''
    Chuyển ảnh từ miền không gian sang tần số
    A: ma trận điểm ảnh 8x8
    DCT: Ma trận điểm ảnh trong miền tần số
    (11/4/2023)
    '''
    def dct(self, A):
        DCT = np.zeros((8, 8))
        for u in range(8):
            for v in range(8):
                sum = 0
                for k in range(8):
                    for l in range(8):
                        sum = sum + A[k][l] * cos(pi * u * (2 * k + 1) / 16) * cos(pi * v * (2 * l + 1) / 16)
                sum = sum * self.C(u) * self.C(v) / 4
                DCT[u][v] = sum
        return DCT
    
    '''
    Chuyển từ miền tần số sang miền không gian
    (11/4/2023)
    '''
    def idct(self, DCT):
        A1 = np.zeros((8, 8))
        for k in range(8):
            for l in range(8):
                sum = 0
                for u in range(8):
                    for v in range(8):
                        sum = sum + cos(pi * u * (2 * k + 1) / 16) * cos(pi * v * (2 * l + 1) / 16) * DCT[u][v] * self.C(u) * self.C(v) / 4
                A1[k][l] = int(round(sum))
        return A1
    

    '''
    Chuyển kênh Y của ảnh từ miền không gian về miền tần số
    Chỉ convert 280 ô ảnh 8x8: do kích thước chữ ký là 40: 17*16 + 1*8
    (11/4/2023)
    '''
    def dctYchanel(self, YChanel):
        ldct = []
        for i in range(0, 129, 8):
            for j in range(0, 121, 8):
                MT = np.zeros((8, 8))
                for k in range(i, i + 8):
                    for l in range(j, j + 8):
                        MT[k % 8][l % 8] = YChanel[k][l]
                D = self.dct(MT)
                ldct.append(D)
        # Bổ sung thêm 8 ô tiếp theo cho đủ 280 ô
        m = 128
        for n in range(0, 57, 8):
            MT = np.zeros((8, 8))
            for k in range(n, n + 8):
                for l in range(m, m + 8):
                    MT[k % 8][l % 8] = YChanel[k][l]
            D = self.dct(MT)
            ldct.append(D)

        return ldct
    
    '''
    Convert kênh Y từ miền tần số về miền không gian
    L: mảng điểm ảnh dct
    (11/4/2023)
    '''
    def idctYchanel(self, YChanel, L):
        tmp = 0
        for i in range(0, 129, 8):
            for j in range(0, 121, 8):
                MT = self.idct(L[tmp])
                for k in range(i, i + 8):
                    for l in range(j, j + 8):
                        YChanel[k][l] = MT[k % 8][l % 8]
                tmp = tmp + 1
        m = 128
        for n in range(0, 57, 8):
            MT = self.idct(L[tmp])
            for k in range(n, n + 8):
                for l in range(m, m + 8):
                    YChanel[k][l] = MT[k % 8][l % 8]
            tmp = tmp + 1

    '''
    Nhúng chữ ký lên ảnh
    Thuật toán Digital watermarking
    Luôn lấy điểm (5,2) và (4,3) để nhúng
    (11/4/2023)
    '''
    def watermarking(self, L, sign):
        tmp = 0
        # print(sign)
        for i in range(len(L)):
            D = L[i]
            if sign[tmp] == '0' and D[5][2] < D[4][3]:
                D[5][2], D[4][3] = D[4][3], D[5][2]
            if sign[tmp] == '1' and D[5][2] >= D[4][3]:
                D[5][2], D[4][3] = D[4][3], D[5][2]
            if (D[5][2] > D[4][3]) and (D[5][2] - D[4][3]) < self.K:
                D[5][2] = D[5][2] + self.K / 2
                D[4][3] = D[4][3] - self.K / 2
            if (D[5][2] <= D[4][3]) and (D[4][3] - D[5][2]) < self.K:
                D[5][2] = D[5][2] - self.K / 2
                D[4][3] = D[4][3] + self.K / 2
            L[i] = D

            tmp = tmp + 1
    '''
    Convert byte to image
    Return base64 string
    x is imYCbCr[:,:,Y], y is imYCbCr[:,:,Cb], z is imYCbCr[:,:,Cr]
    (11/4/2023)
    '''
    def outImage(self, x, y, z):
        out_img_y = im.fromarray(x, "L")
        out_img_cb = im.fromarray(y, "L")
        out_img_cr = im.fromarray(z, "L")
        out_img = im.merge('YCbCr', [out_img_y, out_img_cb, out_img_cr]).convert('RGB')

        buffer = io.BytesIO()
        out_img.save(buffer, format="PNG")
        buffer.seek(0)
        myimage = buffer.getvalue()
        t = base64.b64encode(myimage)
        t = str(t)
        t = t[2:]
        t = t[:-1]
        r = "data:image/png;base64," + t
        return r
    
    '''
    Xử lý nhúng chữ ký lên ảnh
    (11/4/2023)
    '''
    def embedWatermarking(self, base64_string, sign):
        if len(sign) != 40:
            return "Sign invalid"
        
        imYCbCr = self.inputImage(base64_string)

        if type(imYCbCr) == bool:
            return "Image cannot be greyscale"
        
        # Minsize = (144 x 144)
        if imYCbCr.shape[0] < 144 or imYCbCr.shape[1] < 144:
            return "Image is not size enough"
        
        s = self.hexToBinary(sign)
        if(self.handleValidateImage(imYCbCr[:, :, self.Y])):
            caption = self.oImageCaptionBL.createImageCaption(base64_string)
            check = self.checkImageSimilar(base64_string, caption)

            if type(check) == bool and check:
                L = self.dctYchanel(imYCbCr[:, :, self.Y])
                self.watermarking(L, s)
                self.idctYchanel(imYCbCr[:, :, self.Y], L)
                
                imageResult = self.outImage(imYCbCr[:, :, self.Y], imYCbCr[:, :, self.Cb], imYCbCr[:, :, self.Cr])
                
                imgdata = base64.b64decode(base64_string)
                image = im.open(io.BytesIO(imgdata))
                imageView = self.markConfirmIntoImage(image)

                result = {
                    "caption" : caption,
                    "image" : imageResult,
                    "imageMark": imageView,
                    "error": ""
                    
                }
                return result
            
            else:
                result = {
                    "data" : check,
                    "error": "Image has similar"
                }

                return result
            
        else:
            return "Image was had sign"
            
    '''
    Đóng dấu đã xác nhận lên ảnh để view trên ui
    (20/4/2023)
    '''
    def markConfirmIntoImage(self, image):
        mark = im.open('check_mark (1).png', 'r')
        mark = mark.convert("RGBA")

        image.paste(mark, (20, 20), mark)

        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        myimage = buffer.getvalue()
        t = base64.b64encode(myimage)
        t = str(t)
        t = t[2:]
        t = t[:-1]
        r = "data:image/png;base64," + t

        return r
        
    '''
    Xử lý kiểm tra ảnh
    TODO: Chưa có check bằng ML
    (11/4/2023)
    '''    
    def handleValidateImage(self, YChanel):
        lstSign = []

        #Kiểm tra góc trên bên trái
        L = self.dctYchanel(YChanel)
        sign = self.checkWatermarking(L) 
        if(type(sign) == str):
            lstSign.append(sign)
        
        #Kiểm tra góc trên bên phải
        YChanel2 = np.rot90(YChanel)
        L2 = self.dctYchanel(YChanel2)
        sign = self.checkWatermarking(L2) 
        if(type(sign) == str):
            lstSign.append(sign)

        #Kiểm tra góc dưới bên phải
        YChanel3 = np.rot90(YChanel2)
        L3 = self.dctYchanel(YChanel3)
        sign = self.checkWatermarking(L3) 
        if(type(sign) == str):
            lstSign.append(sign)
        
        #Kiểm tra góc dưới bên trái
        YChanel4 = np.rot90(YChanel3)
        L4 = self.dctYchanel(YChanel4)
        sign = self.checkWatermarking(L4) 
        if(type(sign) == str):
            lstSign.append(sign)

        #Kiểm cho trường hợp đảo ngược ảnh
        #Kiểm tra góc trên trái
        YChanelFlip = np.flip(YChanel, 1)
        L5 = self.dctYchanel(YChanelFlip)
        sign = self.checkWatermarking(L5) 
        if(type(sign) == str):
            lstSign.append(sign)

        #Kiểm tra góc trên phải
        YChanel2Flip = np.rot90(YChanelFlip)
        L6 = self.dctYchanel(YChanel2Flip)
        sign = self.checkWatermarking(L6) 
        if(type(sign) == str):
            lstSign.append(sign)

        #Kiểm tra góc dưới phải
        YChanel3Flip = np.rot90(YChanel2Flip)
        L7 = self.dctYchanel(YChanel3Flip)
        sign = self.checkWatermarking(L7) 
        if(type(sign) == str):
            lstSign.append(sign)
        
        #Kiểm tra góc dưới trái
        YChanel4Flip = np.rot90(YChanel3Flip)
        L8 = self.dctYchanel(YChanel4Flip)
        sign = self.checkWatermarking(L8) 
        if(type(sign) == str):
            lstSign.append(sign)
        

        if(len(lstSign) == 0):
            return True
        else:
            return self.oDL.checkExistSign(lstSign)
    
    '''
    Kiểm tra trong ảnh đã có chữ ký hay chưa
    (11/4/2023)
    '''
    def checkWatermarking(self, D):
        sign1 = ""
        for i in range(len(D)):
            x1 = D[i][5][2]
            x2 = D[i][4][3]
            if (x1 > x2):
                sign1 += "0"
            else:
                sign1 += "1"
        digit = []
        sign2 = ""
        for i in range(len(sign1) // 7):
            digit.append(int(sign1[i * 7:i * 7 + 7], 2))

        for i in range(len(digit)):
            if(not(digit[i] >= 48 and digit[i] <= 57) and 
               not(digit[i] >= 65 and digit[i] <= 90) and 
               not(digit[i] >= 97 and digit[i] <= 122)):
                return True
            else:
                sign2 += chr(digit[i])

        return sign2.lower()

    '''
    Lấy text trong ảnh
    (11/4/2023)
    '''
    def getWatermarking(self, D):
        sign1 = ""
        for i in range(len(D)):
            x1 = D[i][5][2]
            x2 = D[i][4][3]
            if (x1 > x2):
                sign1 += "0"
            else:
                sign1 += "1"
        digit = []
        sign2 = ""
        for i in range(len(sign1) // 7):
            digit.append(int(sign1[i * 7:i * 7 + 7], 2))

        for i in range(len(digit)):
            if(not(digit[i] >= 48 and digit[i] <= 57) and 
               not(digit[i] >= 65 and digit[i] <= 90) and 
               not(digit[i] >= 97 and digit[i] <= 122)):
                return None
            else:
                sign2 += chr(digit[i])
        
        #TODO: Gọi DB để kiểm tra xem đã có chữ ký sign2 hay chưa. Tạm cứ trả về sign2

        return sign2 

    
    
    '''
    Kiểm tra độ tương đồng về ảnh
    (22/4/2023)
    '''
    def checkImageSimilar(self, base64string, caption):
        lstImageID = self.oImageCaptionBL.getListImageForCheck(caption)

        lstID = []
        for image in lstImageID:
            lstID.append(image["ImageID"])
        
        result = self.oImageSimilarBL.handleCheckSimilar(lstID, base64string)
        if len(result) == 0:
            return True
        else:
            return result






    


