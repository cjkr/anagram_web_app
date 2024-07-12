fetch("./wordlist.json")
  .then((res) => res.json())
  .then((data) => {
    const wordList = data.words;
    const starters = data.starters;

    const answerHint = document.querySelector(".answerHint");
    const letterBox = document.querySelector(".letterBox");
    const answerBox = document.querySelector(".answerBox");
    const wordBox = document.querySelector(".wordBox");
    const timerLabel = document.querySelector(".timer");
    const scoreLabel = document.querySelector(".score");
    const stopBtn = document.querySelector(".stopBtn");
    const closeHelpBtn = document.querySelector(".closeHelpBtn");
    const helpDialog = document.querySelector(".help");
    const helpBtn = document.querySelector(".helpBtn");

    var letters;
    var answer;
    var words;

    var score = 0;
    var timerInterval;
    var timeLength = 300;
    var timerCount = 0;
    var gameStarted = false;

    init();

    function updateBox(content, className, box) {
      content.forEach((element) =>
        box.appendChild(createDiv(element, className))
      );
    }

    function updateScore(word) {
      let wordScore = Math.floor(word.length ** 1.8) + (word.length ? 1 : 0);
      score += wordScore;
      scoreLabel.innerHTML = `SCORE: ${score}`;
    }

    function init() {
      updateScore("");

      // Initialize boxes
      updateBox("find the".split(""), "letter", letterBox);
      updateBox("anagrams".split(""), "letter", answerBox);
      updateBox(Array(100).fill("XXXX"), "word reveal", wordBox);

      stopBtn.innerHTML = "START";

      stopBtn.addEventListener("click", () => {
        gameStarted ? stopGame() : startGame();
      });

      setTime(timeLength);

      // initialize help dialog
      closeHelpBtn.addEventListener("click", () => {
        helpDialog.classList.add("nohelp");
      });

      helpBtn.addEventListener("click", () => {
        helpDialog.classList.remove("nohelp");
      });

      helpDialog.addEventListener("click", (e) => {
        if (e.target === helpDialog) helpDialog.classList.add("nohelp");
      });
    }

    // Create new div text element with certain class
    function createDiv(content, className) {
      let newElement = document.createElement("div");

      newElement.className =
        content === " " ? "empty" : content === "'" ? "comma" : className;
      newElement.innerText = content;

      return newElement;
    }

    // Format time correctly
    function setTime(t) {
      let timeString = `${Math.floor(t / 60)}:${("00" + (t % 60)).slice(-2)}`;
      timerLabel.innerHTML = timeString;
    }

    function startGame() {
      gameStarted = true;

      score = 0;

      letters = initialLetters().split("");
      answer = [];
      words = initialWords().map((w) => ({
        word: w,
        isFound: false,
      }));

      // clear Children
      clearChildren(letterBox);
      clearChildren(answerBox);
      clearChildren(wordBox);

      // Initialize letters, answer, word boxes
      updateBox(letters, "letter", letterBox);
      updateBox(answer, "letter", answerBox);

      updateScore("");

      words.forEach((word) => {
        wordBox.appendChild(
          createDiv(
            word.isFound
              ? word.word
              : Array(word.word.length).fill("-").join(""),
            "word"
          )
        );
      });

      scrambleLetters();

      timerCount = 0;
      setTime(timeLength);

      clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        timerCount += 1;
        setTime(timeLength - timerCount);
        if (timerCount === timeLength) stopGame();
      }, 1000);

      document.addEventListener("keydown", handleKey);

      stopBtn.innerHTML = "END";
    }

    // Stop game
    function stopGame() {
      gameStarted = false;
      clearInterval(timerInterval);
      document.removeEventListener("keydown", handleKey);

      words.forEach((word, wordIndex) => {
        if (!word.isFound) {
          wordBox.childNodes[wordIndex].innerHTML = word.word;
          wordBox.childNodes[wordIndex].classList.add("reveal");
        }
      });

      clearChildren(letterBox);
      updateBox("time's".split(""), "letter", letterBox);

      clearChildren(answerBox);
      updateBox("up".split(""), "letter", answerBox);

      stopBtn.innerHTML = "START";
    }

    // Clear element of children
    function clearChildren(parent) {
      while (parent.firstChild) parent.removeChild(parent.lastChild);
    }

    // Pick starter at random
    function initialLetters() {
      return starters[Math.floor(Math.random() * starters.length)];
    }

    // Pick corresponding words from wordlist
    function initialWords() {
      return wordList
        .filter((word) => word.length > 2 && compareWord(word))
        .sort((a, b) => a > b || a.length > b.length);
    }

    // Compare word to letters
    function compareWord(word) {
      let tempLetters = [...letters];
      let wordArray = word.split("");

      for (let i = 0; i < wordArray.length; i++) {
        let letterIndex = tempLetters.findIndex((l) => l === wordArray[i]);

        if (letterIndex >= 0) {
          tempLetters.splice(letterIndex, 1);
        } else {
          return false;
        }
      }

      return true;
    }

    // Handle Alphabetic keys(65-90), Space bar(32), Escape(27), Backspace(8)
    function handleKey(e) {
      // console.log(e);
      if (e.keyCode >= 65 && e.keyCode <= 90) {
        // Handle Alphabet keys
        let key = e.key.toLowerCase();

        let letterIndex = letters.findIndex((e) => e === key);

        // If letter in letters array, index found is >= 0, else -1
        if (letterIndex >= 0) {
          // Update arrays
          let foundLetter = letters.splice(letterIndex, 1);
          answer = [...answer, foundLetter[0]];

          // Update Boxes
          let removedLetter = letterBox.removeChild(
            letterBox.childNodes[letterIndex]
          );
          answerBox.appendChild(removedLetter);

          checkAnswer();
        }
      } else if (e.keyCode === 8 && answerBox.hasChildNodes()) {
        // Handle Backspace, remove from answer into letter
        letters = [...letters, answer.pop()];

        let removedLetter = answerBox.removeChild(answerBox.lastChild);
        letterBox.appendChild(removedLetter);
      } else if (e.keyCode === 32) {
        // Scramble letters
        scrambleLetters();
      } else if (e.keyCode === 27) {
        // Clear Boxes
        resetBoxes();
      }
    }

    // Check answer
    function checkAnswer() {
      let word = answer.join("");

      words.forEach((w, wordIndex) => {
        if (w.word === word && !w.isFound) {
          // Create a div with the found word, appearing shortly
          // Move the created div to the position of the word in the wordlist
          // Animate both the fontsize change and the opacity
          // Div should be blue in color

          var initialRect = answerHint.getBoundingClientRect();
          var foundWord = createDiv(w.word, "foundWord");
          foundWord.style.left = answerBox.firstChild.offsetLeft + "px";
          foundWord.style.top = answerBox.firstChild.offsetTop + "px";
          answerHint.appendChild(foundWord);

          var finalRect = wordBox.childNodes[wordIndex].getBoundingClientRect();

          foundWord.style.left = finalRect.left - initialRect.left + "px";
          foundWord.style.top = finalRect.top - initialRect.top + "px";

          foundWord.style.fontSize = "0.75rem";
          foundWord.style.letterSpacing = 0;
          foundWord.style.opacity = 0;

          setTimeout(() => {
            foundWord.remove();
          }, 1000);

          updateScore(w.word);

          resetBoxes();
          w.isFound = true;

          wordBox.childNodes[wordIndex].innerHTML = w.word;
          return;
        }
      });
    }

    // Scramble letters array
    function scrambleLetters() {
      letters = shuffleArray(letters);

      letters.forEach((letter, letterIndex) => {
        letterBox.childNodes[letterIndex].innerHTML = letter;
      });
    }

    // Function to return shuffled array
    function shuffleArray(array) {
      for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * i + 1);
        [array[i], array[j]] = [array[j], array[i]];
      }

      return array;
    }

    function resetBoxes() {
      letters = [...letters, ...answer];
      answer = [];

      while (answerBox.hasChildNodes()) {
        letterBox.appendChild(answerBox.firstChild);
      }
    }
  });
