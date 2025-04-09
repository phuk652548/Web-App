document.addEventListener("DOMContentLoaded", function() {
    const movieOptions = document.querySelectorAll('.movie-option');
    const nextButton = document.getElementById('next-btn');
    const seatSelectionSection = document.getElementById('seat-selection');
    const movieSelectionSection = document.getElementById('movie-selection');
    const seats = document.querySelectorAll('.seat');
    const selectedSeats = document.getElementById('selected-seats');
    const confirmButton = document.getElementById('confirm-btn');
    const bookingSummary = document.getElementById('booking-summary');
    const selectedMovieSpan = document.getElementById('selected-movie');
    const finalSeatsSpan = document.getElementById('final-seats');
    const resetButton = document.getElementById('reset-btn');
    const logoutButton = document.getElementById('logout-btn'); // เพิ่มการค้นหาปุ่ม logout
    const ticketPrice = 200; // กำหนดราคาตั๋วต่อที่นั่ง
    const totalPriceSpan = document.getElementById('total-price');

    let selectedMovie = null;
    let selectedSeatsArray = [];

    // 👉 ดึงชื่อผู้ใช้จาก sessionStorage
    const username = sessionStorage.getItem("username");
    if (!username) {
        alert("กรุณาล็อกอินเพื่อทำการจองตั๋ว");
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('language-select').addEventListener('change', function() {
        const selectedLanguage = this.value; // ภาษาเลือก
        translatePage(selectedLanguage);
    });
    
    function translatePage(language) {
        const elementsToTranslate = document.querySelectorAll('[data-translate]');
    
        elementsToTranslate.forEach(element => {
            const textKey = element.getAttribute('data-translate');
            const translatedText = translateText(textKey, language);
            element.textContent = translatedText;
        });
    
        // ✅ เปลี่ยนสกุลเงินให้ตรงภาษา
        document.getElementById('currency').textContent = translateText('currency', language);
    }
    
    
    // ฟังก์ชันแปลข้อความ (จำลองการแปลข้อความที่เก็บไว้)
    function translateText(key, language) {
        const translations = {
            'movie-booking': {
            'th': 'ระบบจองตั๋วภาพยนตร์',   // ภาษาไทย
            'en': 'Movie Ticket Booking System'  // ภาษาอังกฤษ
            },
            'movie-selection': {
                'th': 'เลือกหนังที่คุณต้องการดู',
                'en': 'Select the movie you want to watch'
            },
            'next-btn': {
                'th': 'ไปที่การจองที่นั่ง',
                'en': 'Go to seat booking'
            },
            'selected-seat':{
                'th':'เลือกที่นั่งสำหรับการจองตั๋ว',
                'en':'Selected seat for booking'
            },
            'selected':{
                'th':'ที่นั่งที่เลือก',
                'en':'Seat selected'
            },
            'total-price': { 
            'th': 'ราคารวม',
            'en': 'Total Price'
            },
            'currency': { 
                'th': 'บาท', 
                'en': 'THB' 
            },
            'seat': { 
                'th': 'ที่นั่ง', 
                'en': 'Seat' 
            },'booking-success': { 
                'th': '✅ จองตั๋วสำเร็จ!', 
                'en': '✅ Booking successful!' 
            },
            'username': { 
                'th': 'ชื่อผู้ใช้', 
                'en': 'Username' 
            },
            'movie': { 
                'th': 'หนัง', 
                'en': 'Movie' 
            },
            'seat': { 
                'th': 'ที่นั่ง', 
                'en': 'Seat' 
            },
            'total-price': { 
                'th': 'ราคารวม', 
                'en': 'Total Price' 
            },
            'currency': { 
                'th': 'บาท', 
                'en': 'THB' 
            } // ✅ แปลสกุลเงิน
            // สามารถเพิ่มข้อความอื่น ๆ ที่ต้องการแปล
        };
    
        return translations[key] && translations[key][language] ? translations[key][language] : key;
    }
    
    

    // เลือกหนัง
    movieOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectedMovie = this.getAttribute('data-movie');
    
            // ลบไฮไลต์จากหนังทุกเรื่องก่อน แล้วเพิ่มให้เฉพาะที่เลือก
            movieOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
    
            // เปิดปุ่มถัดไป
            nextButton.disabled = false;
        });
    });
    

    nextButton.addEventListener('click', function() {
        if (selectedMovie) {
            movieSelectionSection.style.display = 'none';
            seatSelectionSection.style.display = 'block';
            updateSeatAvailability(); // Update seat availability when movie is selected
        } else {
            alert("กรุณาเลือกหนังก่อน");
        }
    });

    // ฟังก์ชันตรวจสอบที่นั่งที่ถูกจองแล้ว
    function updateSeatAvailability() {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const bookedSeats = [];

        // สะสมที่นั่งที่ถูกจองแล้วสำหรับภาพยนตร์ที่เลือก
        bookings.forEach(booking => {
            if (booking.movie === selectedMovie) {
                bookedSeats.push(...booking.seats);
            }
        });

        seats.forEach(seat => {
            const seatNumber = seat.getAttribute('data-seat');
            if (bookedSeats.includes(seatNumber)) {
                seat.disabled = true;  // ปิดการเลือกที่นั่งที่ถูกจองแล้ว
                seat.classList.add('booked');  // เพิ่มคลาสสำหรับการแสดงผลลักษณะที่แตกต่าง
            } else {
                seat.disabled = false;  // เปิดการเลือกที่นั่ง
                seat.classList.remove('booked');
            }
        });
    }

    // ฟังก์ชันเพิ่มหรือเอาที่นั่งที่เลือกออก
    seats.forEach(seat => {
        seat.addEventListener('click', function() {
            if (this.disabled) {
                alert("ที่นั่งนี้ถูกจองแล้ว");
                return;
            }

            this.classList.toggle('selected');
            updateSelectedSeats();
        });
    });

    function updateSelectedSeats() {
        selectedSeatsArray = [];
        selectedSeats.innerHTML = '';
    
        // ดึงภาษาที่เลือกปัจจุบัน
        const language = document.getElementById('language-select').value;
    
        document.querySelectorAll('.seat.selected').forEach(seat => {
            const seatText = seat.getAttribute('data-seat');
            selectedSeatsArray.push(seatText);
        });
    
        selectedSeatsArray.forEach(seat => {
            const listItem = document.createElement('li');
            // ✅ ใช้ translateText() เพื่อแปล "ที่นั่ง"
            listItem.textContent = `${translateText('seat', language)}: ${seat}`;
            selectedSeats.appendChild(listItem);
        });
    
        // ✅ อัปเดตราคารวม
        const totalPrice = selectedSeatsArray.length * ticketPrice;
        document.getElementById('total-price').textContent = totalPrice.toLocaleString();
    
        // ✅ เรียกฟังก์ชันแปลภาษา
        translatePage(language);
    
        // ✅ ปุ่มยืนยันจะเปิดใช้งานเมื่อมีที่นั่งถูกเลือก
        confirmButton.disabled = selectedSeatsArray.length === 0;
    }
    
    
    

    confirmButton.addEventListener('click', function() {
        const language = document.getElementById('language-select').value; // ดึงภาษาปัจจุบัน
    
        if (selectedSeatsArray.length > 0 && selectedMovie) {
            const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            let alreadyBooked = false;
    
            selectedSeatsArray.forEach(seat => {
                const seatAlreadyTaken = bookings.some(booking => 
                    booking.movie === selectedMovie && booking.seats.includes(seat)
                );
                if (seatAlreadyTaken) {
                    alreadyBooked = true;
                }
            });
    
            if (alreadyBooked) {
                alert(translateText('seat-already-booked', language)); // ✅ เปลี่ยนภาษาแจ้งเตือนที่นั่งถูกจองแล้ว
                return;
            }
    
            // บันทึกการจอง
            bookings.push({
                user: username,
                movie: selectedMovie,
                seats: selectedSeatsArray,
                totalPrice: selectedSeatsArray.length * ticketPrice
            });
            localStorage.setItem('bookings', JSON.stringify(bookings));
    
            // แสดงข้อมูลสรุป
            selectedMovieSpan.textContent = selectedMovie;
            finalSeatsSpan.textContent = selectedSeatsArray.join(", ");
            totalPriceSpan.textContent = (selectedSeatsArray.length * ticketPrice).toLocaleString() + " " + translateText('currency', language); // ✅ เปลี่ยนสกุลเงินตามภาษา
    
            seatSelectionSection.style.display = 'none';
            bookingSummary.style.display = 'block';
    
            alert(`${translateText('booking-success', language)}
    ${translateText(' username', language)}: ${username}
    ${translateText(' movie', language)}: ${selectedMovie}
    ${translateText(' seat', language)}: ${selectedSeatsArray.join(", ")}
    ${translateText(' total-price', language)}: ${(selectedSeatsArray.length * ticketPrice).toLocaleString()} ${translateText('currency', language)}`);
    
            location.reload();
        } else {
            alert(translateText('please-select-seat', language)); // ✅ เปลี่ยนภาษาแจ้งเตือนกรณีไม่ได้เลือกที่นั่ง
        }
    });
    
    
        // ฟังก์ชันรีเซ็ตข้อมูลและกลับไปที่หน้าแรก
    resetButton.addEventListener('click', function() {
        movieSelectionSection.style.display = 'block';
        seatSelectionSection.style.display = 'none';
        bookingSummary.style.display = 'none';

        movieOptions.forEach(o => o.classList.remove('selected'));
        selectedSeats.innerHTML = '';
        nextButton.disabled = true;
    });

    // ฟังก์ชันออกจากระบบ
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // ลบข้อมูลผู้ใช้จาก sessionStorage
            sessionStorage.removeItem("username");
            
            // แสดงข้อความเตือนและเปลี่ยนเส้นทางไปหน้า index.html
            alert("คุณได้ออกจากระบบแล้ว");
            window.location.href = 'index.html';
        });
    } else {
        console.log('ไม่พบปุ่ม logout');
    }
});