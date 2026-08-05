// ============================================
// EliteAuction - تسجيل الدخول
// ============================================

const API_BASE = 'http://127.0.0.1:3000/api';

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/';
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
        alert('❌ تعذر الاتصال بالخادم');
    }
}

// التعامل مع نموذج تسجيل الدخول
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }
});
