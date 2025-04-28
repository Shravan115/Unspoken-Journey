from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Admin
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/api/like', methods=['POST'])
def toggle_like():
    try:
        data = request.json
        story_id = data.get('storyId')
        user_id = data.get('userId')
        
        if not story_id or not user_id:
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if user already liked the story
        like_ref = db.collection('likes').where('storyId', '==', story_id).where('userId', '==', user_id)
        like_docs = like_ref.get()

        if like_docs:
            # Unlike - delete the like document
            for doc in like_docs:
                doc.reference.delete()
            return jsonify({'message': 'Story unliked successfully', 'liked': False})
        else:
            # Like - create new like document
            db.collection('likes').add({
                'storyId': story_id,
                'userId': user_id,
                'createdAt': firestore.SERVER_TIMESTAMP
            })
            return jsonify({'message': 'Story liked successfully', 'liked': True})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comment', methods=['POST'])
def add_comment():
    try:
        data = request.json
        story_id = data.get('storyId')
        user_id = data.get('userId')
        user_name = data.get('userName')
        text = data.get('text')

        if not all([story_id, user_id, text]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Add comment to database
        comment_ref = db.collection('comments').add({
            'storyId': story_id,
            'userId': user_id,
            'userName': user_name or 'Anonymous',
            'text': text,
            'createdAt': firestore.SERVER_TIMESTAMP
        })

        return jsonify({'message': 'Comment added successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<story_id>', methods=['GET'])
def get_comments(story_id):
    try:
        comments_ref = db.collection('comments').where('storyId', '==', story_id).order_by('createdAt', direction=firestore.Query.DESCENDING)
        comments = []
        
        for doc in comments_ref.get():
            comment = doc.to_dict()
            comment['id'] = doc.id
            comments.append(comment)

        return jsonify({'comments': comments})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/likes/<story_id>', methods=['GET'])
def get_likes(story_id):
    try:
        likes_ref = db.collection('likes').where('storyId', '==', story_id)
        likes_count = len(list(likes_ref.get()))
        
        return jsonify({'likes': likes_count})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 