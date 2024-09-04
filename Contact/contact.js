
   document.getElementById('contactForm').addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default form submission
      var form = event.target;

      fetch(form.action, {
         method: form.method,
         body: new FormData(form),
         headers: {
            'Accept': 'application/json'
         }
      }).then(function(response) {
         if (response.ok) {
            alert('Thank you for your message! We will get back to you soon.');
            form.reset(); // Clear the form
         } else {
            alert('Oops! There was a problem submitting your form.');
         }
      }).catch(function(error) {
         alert('Oops! There was a problem submitting your form.');
      });
   });