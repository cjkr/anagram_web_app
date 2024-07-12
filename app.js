fetch('./wordlist.json')
  .then(res => res.json())
  .then( data => {

    const wordlist = data.words;
    const starters = data.starters;

    // console.log(wordlist);
    // console.log(starters);

    const letterbox = document.querySelector('.letterbox');
    const answerbox = document.querySelector('.answerbox');
    const words = document.querySelector('.words');
    const scoreLabel = document.querySelector('.score');
    const startBtn = document.querySelector('.start-btn');
    const endBtn = document.querySelector('.end-btn');
    const playBox = document.querySelector('.play');
    const pauseBox = document.querySelector('.pause');

    const finalScore = document.querySelector('.final-score');
    const finalLetters = document.querySelector('.final-letters');
    const finalWords = document.querySelector('.final-words');
    
    var letters;
    var answers;
    
    var foundSolutions;
    var solutions;
    
    var score;
    
    // console.log(starters.length)

    startBtn.addEventListener('click', startGame);
    endBtn.addEventListener('click', endGame);
    
    // init()

    function findSolutions(starter) {
      return wordlist.filter((w) => {
        if (w.length < 3) return false;

        let arrayW = w.split('');
        let arrayStarter = starter.split('');

        while (arrayW.length > 0) {
          let a = arrayW.pop();

          if (!arrayStarter.includes(a)) {
            return false;
          }

          arrayStarter.splice(arrayStarter.findIndex(k => k === a), 1);
        }

        return true;
      });
    }

    // console.log(findSolutions('beatniks'));

    function randomStarter() {
      return starters[Math.floor(Math.random() * starters.length)];
    }
    
    function checkLetters() {
      var s = answers.join('');
      if (solutions.includes(s) && !foundSolutions.includes(s)) {
        score += Math.floor((s.length**2)/4) + s.length;
        foundSolutions.push(s);
    
        addChild(words, 'word', s);
    
        while (answers.length > 0) {
          let letter = answers.pop()[0];
    
          addChild(letterbox, 'letter', letter);
          answerbox.removeChild(answerbox.lastChild);
    
          letters.push(letter);
        }
    
        updateScore(score);
      }
    }
    
    function addChild(parent, className, text) {
      let newElement = document.createElement('div');
      newElement.className = className;
      newElement.innerHTML = text;
      parent.appendChild(newElement);
    }
    
    function shuffleLetters() {
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      
      clearParent(letterbox);
      resetLetterBox(letterbox);
    }
    
    function resetLetterBox(parent) {
      for (let i = 0; i < letters.length; i++) {
    
        addChild(parent, 'letter', letters[i]);
      }
    }
    
    function init() {
      score = 0;

      let word = randomStarter();
      
      letters = word.split('');
      answers = [];

      solutions = findSolutions(word);
      foundSolutions = [];

      resetLetterBox(letterbox);
      updateScore(0);
      shuffleLetters();
      clearParent(answerbox);
      window.addEventListener('keydown', letterChange);
    }

    function startGame(e) {
      playBox.classList.remove('nodisplay');
      pauseBox.classList.add('nodisplay');
      
      init();

    }
    
    function endGame(e) {
      playBox.classList.add('nodisplay');
      pauseBox.classList.remove('nodisplay');
      window.removeEventListener('keydown');
      
      finalScore.innerHTML = score;

      clearParent(finalLetters);
      resetLetterBox(finalLetters);

      clearParent(finalWords);

    }

    function clearParent(parent) {
      while(parent.firstChild) {
        parent.firstChild.remove();
      }
    }
    
    function updateScore(s) {
      scoreLabel.innerHTML = s;
    }
    
    function letterChange(e) {
      var k = e.key;
    
      if (k === 'Backspace') {
        let letter = answers.pop()[0];
    
        addChild(letterbox, 'letter', letter);
        answerbox.removeChild(answerbox.lastChild);
    
        letters.push(letter);
      } else if (k === ' ') {
        shuffleLetters();
      } else {
        var i = letters.findIndex((c) => k === c);
    
        if (i !== -1) {
          let letter = letters.splice(i, 1);
    
          addChild(answerbox, 'letter', letter);
          letterbox.removeChild(letterbox.children[i]);
    
          answers.push(letter);
          checkLetters();
        }
      }
    
    }
  }
    

  );