document.addEventListener("DOMContentLoaded", function(){
   async function fetchJSONFile(url) {
      try {
      const response = await fetch(url, {
            headers: {
               'Accept': 'application/json',
            }
         });
      if (!response.ok) {
         throw new Error('Network response was not ok');
      }
      const json = await response.json();
      console.log(json);
      return json;
      } catch (error) {
      console.error('Error fetching JSON file:', error);
      }
   }

   var wofTexts = [];
   var wofTextIndex = 0;
   var curWofText = "";
   var curWofClue = "";
   var selectedLetters = [];
   var errorCounter = 0;
   
   // Usage: Fetching and using the JSON data
   fetch('./js/wof.json').then(response => response.json()).then(data => {
      wofTexts = data.wofTexts;
      let curWof = wofTexts[wofTextIndex];
      if (curWof) {
         setCurWof(curWof);
         document.querySelector(".wof__letters").innerHTML = generate(curWofText);
         document.querySelector(".wof__clue h2").innerText = curWofClue;
      }
   })

   function generate (text, reveal=false, html=[]) {
      let word = text.split(" ");
      let limitPerRow = 12;
      let counter = 0;
      for (let i=0; i<word.length;i++) {
         if (i == 0) {
            // start
            html.push("<div class='wof__row'>");
         }
         let currWord = word[i].split("");
         counter += currWord.length;
         if (counter > limitPerRow) {
            html.push("</div>");
            html.push("<div class='wof__row'>");
            for (let x=0; x<currWord.length; x++) {
               if (reveal) {
                     let className = selectedLetters.includes(currWord[x].toUpperCase()) ? "" : "riser";
                     html.push("<span><span class='" + className + "'>" + currWord[x] + "</span></span>")
               } else {
                     html.push("<span data-letter='" + currWord[x].toUpperCase() + "'>_</span>");
               }
            }
            // reset counter
            counter = currWord.length;
         } else {
            for (let x=0; x<currWord.length; x++) {
               if (reveal) {
                  let className = selectedLetters.includes(currWord[x].toUpperCase()) ? "" : "riser";
                  html.push("<span><span class='"+ className + "'>" + currWord[x] + "</span></span>")
               } else {
                     html.push("<span data-letter='" + currWord[x].toUpperCase() + "'>_</span>");
               }
            }
         }    
         if ((i+1) == word.length){
            // end
            html.push("</div>");
         } else {
            // this is space block
            html.push("<span></span>");
            counter++;
         }
      }
      return html.join("");
   }

   function setCurWof(wof) {
      curWofText = wof.text;
      curWofClue = wof.clue;
   }

   function resetLetterButtons() {
      document.querySelectorAll(".letter-btn.none").forEach(function(button){
         button.classList.remove("none");
      });
      document.querySelectorAll(".letter-btn.has").forEach(function(button){
         button.classList.remove("has");
      });
   }

   document.querySelector("button.reveal").addEventListener("click", function() {
      document.querySelector(".wof__letters").innerHTML = generate(curWofText, true);
   });

   document.querySelector("button.nextRound").addEventListener("click", function() {
      wofTextIndex++;
      let curWof = wofTexts[wofTextIndex];
      if (!curWof) {
         wofTextIndex = 0;
         curWof = wofTexts[wofTextIndex];
      }
      setCurWof(curWof);
      document.querySelector(".wof__letters").innerHTML = generate(curWofText);
      document.querySelector(".wof__clue h2").innerText = curWofClue;

      resetLetterButtons();
      selectedLetters = [];
      errorCounter = 0;
      updateStrikeHtml();
   });

   document.querySelectorAll(".letter-btn").forEach(function(button){
      button.addEventListener("click", function() {
         let letter = this.innerText;
         let foundLetters = document.querySelectorAll("[data-letter='" + letter + "']");
         foundLetters.forEach(function(span) {
            let letter = span.dataset.letter;
            span.innerHTML = "<span class='riser'>" + letter + "</span>";
         });
         if (foundLetters.length > 0) {
            this.classList.add("has");
            selectedLetters.push(letter);   
         } else {
            this.classList.add("none");
            errorCounter++;
            updateStrikeHtml();
         }
      });
   });

   function updateStrikeHtml() {
      console.log(errorCounter);
      let html = [];
      for (let i=0; i<5; i++) {
         let hasError = errorCounter > i ? "bad" : "";
         html.push("<li>");
         html.push("<span class='wof__strikeCircle " + hasError + "'></span>");
         html.push("</li>");
      }
      document.querySelector(".wof__strikeStatus").innerHTML = html.join("");
   }

});