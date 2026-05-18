import re
import random
import string

def analyze_password(password):
    score = 0
    feedback = []
    
    # 1. Length check
    if len(password) < 8:
        feedback.append("Password is too short. Use at least 8 characters.")
    elif len(password) >= 12:
        score += 2
    else:
        score += 1
        
    # 2. Lowercase check
    if re.search(r'[a-z]', password):
        score += 1
    else:
        feedback.append("Add lowercase letters.")

    # 3. Uppercase check
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        feedback.append("Add uppercase letters.")

    # 4. Digits check
    if re.search(r'\d', password):
        score += 1
    else:
        feedback.append("Add numbers.")

    # 5. Symbols check
    if re.search(r'[^A-Za-z0-9]', password):
        score += 1
    else:
        feedback.append("Add special characters (e.g., !, @, #, $).")
        
    # Normalize score to be max 5
    if score > 5:
        score = 5
    if score == 0 and len(password) > 0:
        score = 1 # At least 1 if not empty

    # Generate suggestions if weak
    suggestions = []
    if score < 4:
        suggestions.append("Consider using a passphrase: a sequence of random words (e.g., 'CorrectHorseBatteryStaple').")
        
        # Generate a strong alternative
        chars = string.ascii_letters + string.digits + "!@#$%^&*"
        strong_alt = "".join(random.choice(chars) for _ in range(16))
        suggestions.append(f"Example of a strong password: {strong_alt}")

    # Determine label
    labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"]
    label = labels[score - 1] if score > 0 else ""

    return {
        "score": score,
        "label": label,
        "feedback": feedback,
        "suggestions": suggestions
    }
