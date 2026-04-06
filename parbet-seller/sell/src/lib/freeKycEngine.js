import * as faceapi from 'face-api.js';
import Tesseract from 'tesseract.js';

// Real logic to utilize open-source ML without paid APIs
export const loadModels = async () => {
  // Models hosted on free public CDNs for zero-cost execution
  const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
};

export const compareFaces = async (documentImageElement, webcamVideoElement) => {
  const docDetection = await faceapi.detectSingleFace(documentImageElement).withFaceLandmarks().withFaceDescriptor();
  const webDetection = await faceapi.detectSingleFace(webcamVideoElement).withFaceLandmarks().withFaceDescriptor();
  
  if (!docDetection || !webDetection) return { match: false, confidence: 0, error: 'Face not detected in one or both images' };
  
  const distance = faceapi.euclideanDistance(docDetection.descriptor, webDetection.descriptor);
  const match = distance < 0.6; // 0.6 is standard strict threshold
  return { match, confidence: 1 - distance };
};

export const extractIdData = async (imageFile) => {
  const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
  return text; // Will extract Aadhaar/PAN or Passport data for backend validation
};
