// เรียกใช้ฟอร์มและปุ่มต่าง ๆ
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginButton = document.getElementById("login-form-submit");
const registerButton = document.getElementById("register-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");
const registerErrorMsg = document.getElementById("register-error-msg");
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");

// เมื่อหน้าเว็บโหลดใหม่
window.onload = () => {
    // ตรวจสอบว่า user ล็อกอินอยู่หรือไม่
    if (sessionStorage.getItem("loggedIn") === "true") {
        alert("You are already logged in.");
        window.location.href = "index1.html"; // ไปที่หน้า Dashboard
    } else {
        document.getElementById("login-container").style.display = "block"; // แสดงฟอร์ม Login
        document.getElementById("register-container").style.display = "none"; // ซ่อนฟอร์ม Register
    }
};

// ฟังก์ชันการแสดงฟอร์มสมัครสมาชิก
showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    document.getElementById("login-container").style.display = "none"; // ซ่อนฟอร์ม Login
    document.getElementById("register-container").style.display = "block"; // แสดงฟอร์ม Register
});

// ฟังก์ชันการแสดงฟอร์มล็อกอิน
showLoginLink.addEventListener("click", (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    document.getElementById("register-container").style.display = "none"; // ซ่อนฟอร์ม Register
    document.getElementById("login-container").style.display = "block"; // แสดงฟอร์ม Login
});

// การล็อกอิน
loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    // ส่งข้อมูลไปยัง API สำหรับการล็อกอิน
    fetch('http://127.0.0.1:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        
        if (data.message === "Login successful") {
            sessionStorage.setItem("authToken", data.token);
            sessionStorage.setItem("username", data.username);
            alert("You have successfully logged in.");
            window.location.href = "index1.html"; // ไปที่หน้า Dashboard
        } else {
            loginErrorMsg.style.display = "block"; // แสดงข้อความผิดพลาด
        }
    })
    .catch(error => {
        console.error("Error:", error);
        loginErrorMsg.style.display = "block"; // แสดงข้อความผิดพลาด
    });
});

// การสมัครสมาชิก
registerButton.addEventListener("click", (e) => {
  e.preventDefault();
  const username = registerForm.username.value;
  const password = registerForm.password.value;

  // ส่งข้อมูลไปยัง API สำหรับการสมัครสมาชิก
  fetch('http://127.0.0.1:3000/register', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
      if (data.message === "User registered successfully") {
          alert("You have successfully registered. Please log in.");
          document.getElementById("register-container").style.display = "none";
          document.getElementById("login-container").style.display = "block"; // กลับไปหน้า Login
      } else if (data.message === "Username already exists") {
          registerErrorMsg.style.display = "block";
          registerErrorMsg.innerText = "Username already exists. Please choose a different username.";
      } else {
          registerErrorMsg.style.display = "block"; // แสดงข้อความผิดพลาด
      }
  })
  .catch(error => {
      console.error("Error:", error);
      registerErrorMsg.style.display = "block";
      registerErrorMsg.innerText = "An error occurred. Please try again later.";
  });
});
