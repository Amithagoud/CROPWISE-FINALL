import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as tf from 'npm:@tensorflow/tfjs@4.17.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/plant_disease/1/default/1';
let model: tf.GraphModel | null = null;

const diseaseClasses = [
  'tomato_late_blight',
  'rice_blast',
  'wheat_rust'
];

async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel(MODEL_URL);
  }
  return model;
}

async function preprocessImage(imageData: ArrayBuffer): Promise<tf.Tensor> {
  const tensor = tf.node.decodeImage(new Uint8Array(imageData), 3);
  const resized = tf.image.resizeBilinear(tensor as tf.Tensor3D, [224, 224]);
  const expanded = resized.expandDims(0);
  return expanded.div(255.0);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      throw new Error('No image provided');
    }

    const imageBuffer = await image.arrayBuffer();
    const inputTensor = await preprocessImage(imageBuffer);
    const model = await loadModel();
    
    const predictions = await model.predict(inputTensor) as tf.Tensor;
    const probabilities = await predictions.data();
    
    // Get the index of the highest probability
    const maxProbIndex = probabilities.indexOf(Math.max(...probabilities));
    const detectedDisease = diseaseClasses[maxProbIndex];
    const confidence = Math.round(probabilities[maxProbIndex] * 100);

    // Get disease details from database or predefined mapping
    const diseaseInfo = {
      disease: detectedDisease,
      confidence: confidence,
      details: {
        name: detectedDisease.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        symptoms: [
          'Visible spots or lesions on leaves',
          'Discoloration of affected areas',
          'Wilting or dying tissue'
        ],
        treatment: [
          'Remove infected plant parts',
          'Apply appropriate fungicide',
          'Improve air circulation',
          'Adjust watering practices'
        ],
        prevention: [
          'Use resistant varieties',
          'Practice crop rotation',
          'Maintain proper spacing',
          'Monitor regularly for early signs'
        ]
      }
    };

    return new Response(
      JSON.stringify(diseaseInfo),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});