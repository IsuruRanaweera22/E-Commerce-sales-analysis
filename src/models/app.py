import re
import torch
import pickle
from flask import Flask, request, jsonify
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from transformers import BertTokenizer, BertModel
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
with open("rf_model_for_fake_reviews.pkl", "rb") as model_file:
    rf_model_for_fake_reviews = pickle.load(model_file)

with open("tfidf_vectorizer_for_fake_reviews.pkl", "rb") as vec_file:
    tfidf_vectorizer_for_fake_reviews = pickle.load(vec_file)

with open('svm_model_for_ProductNSeller_reviews.pkl', 'rb') as model_file:
    svm_model_for_ProductNSeller_reviews = pickle.load(model_file)

with open('vectorizer_for_ProductNSeller_reviews.pkl', 'rb') as vectorizer_file:
    vectorizer_for_ProductNSeller_reviews = pickle.load(vectorizer_file)

with open('lasso_rating_model.pkl', 'rb') as lasso_rating:
    lasso_rating = pickle.load(lasso_rating)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertModel.from_pretrained('bert-base-uncased').to(device)

def preprocess_text(text):
    if isinstance(text, float):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stopwords.words('english')]
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    return ' '.join(tokens)

def get_bert_embeddings(text):
    tokens = tokenizer(text, padding='max_length', truncation=True, max_length=512, return_tensors='pt')
    tokens = {key: val.to(device) for key, val in tokens.items()}
    with torch.no_grad():
        outputs = bert_model(**tokens)
    return outputs.last_hidden_state[:, 0, :].cpu().numpy()

@app.route('/predictFakeReviews', methods=['POST'])
def predictFakeReviews():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    cleaned_text = preprocess_text(text)
    X_tfidf = tfidf_vectorizer_for_fake_reviews.transform([cleaned_text])
    
    prediction = rf_model_for_fake_reviews.predict(X_tfidf)[0]
    label = "OR" if prediction == 1 else "CG"
    
    return jsonify({'prediction': label})

@app.route('/predictProductNSellerReviews', methods=['POST'])
def predictProductNSellerReviews():
    data = request.get_json()
    if 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    cleaned_text = preprocess_text(text)
    text_vectorized = vectorizer_for_ProductNSeller_reviews.transform([cleaned_text])
    prediction = svm_model_for_ProductNSeller_reviews.predict(text_vectorized)[0]
    
    return jsonify({'review': text, 'predicted_category': prediction})

@app.route('/predictEngagement', methods=['POST'])
def predict_engagement():
    data = request.json
    
    # Create DataFrame with the input data
    new_data = pd.DataFrame({
        'Total_Reactions': [data['Total_Reactions']],
        'Comments': [data['Comments']],
        'Shares': [data['Shares']],
        'Views': [data['Views']]
    })
    
    try:
        # Predict rating (assuming lasso_rating is your trained model)
        rating_pred = lasso_rating.predict(new_data)[0]
        
        # Predict review count (assuming you have another model for this)
        # If you don't have a review count model, you could calculate based on some formula
        # For example: review_count_pred = (data['Comments'] * 0.5 + data['Shares'] * 0.3) / 2
        # Or use another model if available
        review_count_pred = int((data['Comments'] * 0.5 + data['Shares'] * 0.3)) / 2
        
        return jsonify({
            'rating': float(rating_pred),
            'review_count': int(review_count_pred)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    @app.after_request
    def after_request(response):
        print(response.headers)
        return response

    app.run(debug=True)
