const STORAGE_KEY = 'productDescriptionGeneratorState';

const elements = {
    form: document.getElementById('productForm'),
    generateBtn: document.getElementById('generateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    copyBtn: document.getElementById('copyBtn'),
    outputSection: document.getElementById('outputSection'),
    outputDescription: document.getElementById('outputDescription'),
    wordCount: document.getElementById('wordCount'),
    productName: document.getElementById('productName'),
    productCategory: document.getElementById('productCategory'),
    keyFeatures: document.getElementById('keyFeatures'),
    targetAudience: document.getElementById('targetAudience'),
    toneOfVoice: document.getElementById('toneOfVoice')
};

function initializeApp() {
    loadFromLocalStorage();
    attachEventListeners();
}

function attachEventListeners() {
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.copyBtn.addEventListener('click', handleCopy);
    
    const inputs = elements.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = getFormData();
    saveToLocalStorage(formData);
    generateDescription(formData);
}

function validateForm() {
    let isValid = true;
    const requiredFields = [
        elements.productName,
        elements.productCategory,
        elements.keyFeatures,
        elements.targetAudience,
        elements.toneOfVoice
    ];
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(`${field.id}Error`);
    
    if (!value) {
        field.classList.add('error');
        errorElement.textContent = 'This field is required';
        return false;
    }
    
    if (field.id === 'keyFeatures' && value.length < 10) {
        field.classList.add('error');
        errorElement.textContent = 'Please provide more detailed features';
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function clearFieldError(field) {
    const errorElement = document.getElementById(`${field.id}Error`);
    field.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function getFormData() {
    const descriptionLength = document.querySelector('input[name="descriptionLength"]:checked').value;
    
    return {
        productName: elements.productName.value.trim(),
        productCategory: elements.productCategory.value,
        keyFeatures: elements.keyFeatures.value.trim(),
        targetAudience: elements.targetAudience.value.trim(),
        toneOfVoice: elements.toneOfVoice.value,
        descriptionLength: descriptionLength
    };
}

function generateDescription(formData) {
    setLoadingState(true);
    
    setTimeout(() => {
        const description = createAIDescription(formData);
        displayDescription(description);
        setLoadingState(false);
    }, 1500);
}

function createAIDescription(data) {
    const features = parseFeatures(data.keyFeatures);
    const isLong = data.descriptionLength === 'long';
    
    const templates = {
        Professional: {
            short: (name, category, features, audience) => 
                `Introducing ${name}, a premium ${category.toLowerCase()} solution designed for ${audience}. ${features.slice(0, 3).join('. ')}. Engineered for performance and reliability, this product delivers exceptional value and meets the highest industry standards.`,
            long: (name, category, features, audience) => 
                `Introducing ${name}, a cutting-edge ${category.toLowerCase()} solution meticulously designed for ${audience}. This product combines innovation with functionality to deliver outstanding results. ${features.join('. ')}. Engineered with precision and built to last, ${name} meets the highest industry standards and exceeds expectations. Our commitment to quality ensures that every aspect of this product has been optimized for maximum performance, reliability, and user satisfaction. Whether you're looking for efficiency, durability, or superior functionality, ${name} provides a comprehensive solution that addresses your needs. Backed by rigorous testing and quality assurance, this ${category.toLowerCase()} product represents the perfect balance of innovation and practicality. Invest in excellence and experience the difference that professional-grade quality makes in your daily operations.`
        },
        Friendly: {
            short: (name, category, features, audience) => 
                `Hey there! Meet ${name}, your new favorite ${category.toLowerCase()} companion! Perfect for ${audience}, this amazing product brings you ${features.slice(0, 2).join(', and ')}. It's designed to make your life easier and more enjoyable. You're going to love it!`,
            long: (name, category, features, audience) => 
                `Hey there! We're super excited to introduce you to ${name}, your new favorite ${category.toLowerCase()} companion! If you're ${audience}, this is exactly what you've been looking for. Let's talk about what makes this product so special! ${features.join('. ')}. But that's not all! ${name} was created with you in mind, combining functionality with a user-friendly design that makes every interaction a breeze. We know how important it is to have products that just work, without any hassle or complications. That's why we've poured our hearts into making ${name} the best it can be. Whether you're using it every day or just once in a while, you'll appreciate the thoughtful details and quality construction. It's like having a reliable friend by your side, always ready to help out. Plus, it looks great and fits perfectly into your lifestyle. We're confident that once you try ${name}, you'll wonder how you ever lived without it. So go ahead, treat yourself – you deserve it!`
        },
        Creative: {
            short: (name, category, features, audience) => 
                `✨ Discover ${name} – where innovation meets imagination! This isn't just another ${category.toLowerCase()} product; it's a game-changer for ${audience}. Experience ${features.slice(0, 2).join(' and ')}. Break free from the ordinary and embrace the extraordinary!`,
            long: (name, category, features, audience) => 
                `✨ Get ready to experience something truly remarkable! ${name} isn't just another ${category.toLowerCase()} product – it's a revolutionary creation designed to inspire and transform the way ${audience} interact with their world. Imagine a product that truly understands your needs and exceeds your wildest expectations. That's ${name}. ${features.join('. ')}. But here's where it gets really interesting: this product was born from a passion for innovation and a desire to challenge the status quo. We asked ourselves, "What if we could create something that doesn't just meet needs, but anticipates them?" The result is ${name}, a harmonious blend of cutting-edge technology, thoughtful design, and pure creative genius. Every curve, every feature, every detail has been crafted with intention and care. This isn't mass-produced mediocrity – it's artisanal excellence. When you choose ${name}, you're not just buying a product; you're investing in a vision of what's possible. You're joining a community of forward-thinkers who refuse to settle for "good enough." So take the leap, embrace the new, and discover what happens when creativity meets functionality in perfect harmony.`
        },
        Minimalist: {
            short: (name, category, features, audience) => 
                `${name}. ${category}. ${features.slice(0, 3).join('. ')}. Designed for ${audience} who value simplicity and quality. Nothing more, nothing less.`,
            long: (name, category, features, audience) => 
                `${name}. A ${category.toLowerCase()} product that embodies the essence of minimalism. ${features.join('. ')}. Created for ${audience} who understand that true sophistication lies in simplicity. Every element serves a purpose. No unnecessary complications. No excess. Just pure, focused functionality delivered through clean, elegant design. ${name} strips away the superfluous to reveal what truly matters: performance, quality, and user experience. In a world cluttered with noise and distraction, this product stands as a testament to the power of restraint. Each feature has been carefully considered and deliberately included. Nothing is arbitrary. The result is a refined product that does exactly what it should, exactly when it should, without pretense or embellishment. This is intentional design at its finest. For those who appreciate the beauty of simplicity and the strength of purpose, ${name} represents an ideal. It doesn't shout for attention; it commands respect through quiet confidence. Essential. Efficient. Elegant. This is ${name}.`
        },
        Luxurious: {
            short: (name, category, features, audience) => 
                `Indulge in the exquisite ${name}, a prestigious ${category.toLowerCase()} masterpiece crafted exclusively for discerning ${audience}. ${features.slice(0, 2).join(', complemented by ')}. Experience unparalleled elegance and refined sophistication. You deserve nothing but the finest.`,
            long: (name, category, features, audience) => 
                `Prepare to enter a world of unparalleled luxury with ${name}, an extraordinary ${category.toLowerCase()} masterpiece that redefines excellence. Exclusively designed for distinguished ${audience} who demand nothing but the absolute finest, this exceptional product represents the pinnacle of sophistication and refinement. ${features.join('. ')}. Every element of ${name} has been meticulously crafted by master artisans who understand that true luxury lies in the details. From the premium materials sourced from the world's finest suppliers to the impeccable finishing touches that define true craftsmanship, no expense has been spared in creating this magnificent product. This is not merely a purchase; it is an investment in your lifestyle, a statement of your impeccable taste, and a testament to your appreciation for the finer things in life. ${name} transcends ordinary utility to become a symbol of prestige and exclusivity. Limited in availability and unlimited in quality, this distinguished ${category.toLowerCase()} offering provides an experience that is as rare as it is remarkable. When you choose ${name}, you join an elite circle of connoisseurs who understand that true value cannot be measured merely in price, but in the incomparable experience of owning something truly exceptional. Elevate your standards. Embrace the extraordinary. Experience ${name}.`
        }
    };
    
    const template = templates[data.toneOfVoice];
    const length = isLong ? 'long' : 'short';
    
    return template[length](
        data.productName,
        data.productCategory,
        features,
        data.targetAudience
    );
}

function parseFeatures(featuresText) {
    let features = featuresText
        .split(/[,\n]/)
        .map(f => f.trim())
        .filter(f => f.length > 0)
        .map(f => f.replace(/^[-•*]\s*/, ''))
        .filter(f => f.length > 0);
    
    features = features.map(feature => {
        if (!feature.match(/[.!?]$/)) {
            return feature;
        }
        return feature;
    });
    
    return features;
}

function displayDescription(description) {
    elements.outputDescription.value = description;
    elements.outputSection.style.display = 'block';
    
    const wordCountValue = countWords(description);
    elements.wordCount.textContent = `${wordCountValue} words`;
    
    elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function countWords(text) {
    return text.trim().split(/\s+/).length;
}

function setLoadingState(isLoading) {
    const btnText = elements.generateBtn.querySelector('.btn-text');
    const btnLoader = elements.generateBtn.querySelector('.btn-loader');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        elements.generateBtn.disabled = true;
        elements.resetBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        elements.generateBtn.disabled = false;
        elements.resetBtn.disabled = false;
    }
}

function handleCopy() {
    const description = elements.outputDescription.value;
    
    navigator.clipboard.writeText(description).then(() => {
        showCopyFeedback();
    }).catch(err => {
        fallbackCopyToClipboard(description);
    });
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    const copyText = elements.copyBtn.querySelector('.copy-text');
    const copiedText = elements.copyBtn.querySelector('.copied-text');
    
    copyText.style.display = 'none';
    copiedText.style.display = 'inline';
    elements.copyBtn.disabled = true;
    
    setTimeout(() => {
        copyText.style.display = 'inline';
        copiedText.style.display = 'none';
        elements.copyBtn.disabled = false;
    }, 2000);
}

function handleReset() {
    elements.form.reset();
    elements.outputSection.style.display = 'none';
    
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
    
    localStorage.removeItem(STORAGE_KEY);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveToLocalStorage(formData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            
            if (data.productName) elements.productName.value = data.productName;
            if (data.productCategory) elements.productCategory.value = data.productCategory;
            if (data.keyFeatures) elements.keyFeatures.value = data.keyFeatures;
            if (data.targetAudience) elements.targetAudience.value = data.targetAudience;
            if (data.toneOfVoice) elements.toneOfVoice.value = data.toneOfVoice;
            
            if (data.descriptionLength) {
                const radio = document.querySelector(`input[name="descriptionLength"][value="${data.descriptionLength}"]`);
                if (radio) radio.checked = true;
            }
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
