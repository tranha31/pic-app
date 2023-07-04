from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import torch
from PIL import Image

class ImageCaption:

    model = None
    feature_extractor = None
    tokenizer = None
    device = None

    def __init__(self) -> None:
        self.createModelEncodeImage()
        pass

    def createModelEncodeImage(self):
        self.model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
        self.feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
        self.tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)


    def generateCaption(self, image):   
        max_length = 16
        num_beams = 4
        gen_kwargs = {"max_length": max_length, "num_beams": num_beams}     
        images = [image]
        pixel_values = self.feature_extractor(images=images, return_tensors="pt").pixel_values
        pixel_values = pixel_values.to(self.device)

        output_ids = self.model.generate(pixel_values, **gen_kwargs)

        preds = self.tokenizer.batch_decode(output_ids, skip_special_tokens=True)
        preds = [pred.strip() for pred in preds]

        return preds[0]
    


    
    