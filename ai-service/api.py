import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from collections import deque
from flask import Flask, request, jsonify
import os

# --- Load the trained model and tokenizer ---
print("Loading AI model and tokenizer...")
model = load_model(os.path.join('models', 'timeline_model_v3.h5'))
with open(os.path.join('processed_data', 'lstm_tokenizer_v3.pkl'), 'rb') as f:
    tokenizer = pickle.load(f)

MAX_SEQUENCE_LEN = 100 
app = Flask(__name__)

# --- Prediction Logic ---
def predict_next_events(seed_text, num_events_to_predict=15, temperature=1.0):
    generated_text = seed_text
    event_history = deque(seed_text.split(), maxlen=3)
    
    for _ in range(num_events_to_predict):
        token_list = tokenizer.texts_to_sequences([generated_text])[0]
        padded_token_list = pad_sequences([token_list], maxlen=MAX_SEQUENCE_LEN-1, padding='pre')
        predicted_probs = model.predict(padded_token_list, verbose=0)[0]
        
        predicted_probs = np.asarray(predicted_probs).astype('float64')
        predicted_probs = np.log(predicted_probs + 1e-7) / temperature
        exp_preds = np.exp(predicted_probs)
        predicted_probs = exp_preds / np.sum(exp_preds)
        
        output_word = ""
        for i in np.argsort(predicted_probs)[::-1]:
            word = tokenizer.index_word.get(i, "")
            if word not in event_history:
                output_word = word
                break
        if not output_word: output_word = tokenizer.index_word.get(np.argmax(predicted_probs), "")
        
        if not output_word or output_word == "<oov>" or "discharge" in output_word:
            break
            
        generated_text += " " + output_word
        event_history.append(output_word)
        
    return generated_text

# --- API Endpoint ---
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if 'seed_text' not in data:
        return jsonify({'error': 'Missing "seed_text"'}), 400

    seed_text = data['seed_text']
    temperature = data.get('temperature', 1.0)
    
    prediction = predict_next_events(seed_text, temperature=temperature)
    return jsonify({'predicted_timeline': prediction})

# --- Run the Server ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)