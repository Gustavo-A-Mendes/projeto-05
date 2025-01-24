import React, { useState, useEffect } from 'react';
import './App.css'; // Para estilização básica
import explosionSoundFile from './sounds/explosion.mp3'; // Certifique-se de adicionar este arquivo à pasta pública ou src
import buttonClickSoundFile from './sounds/pop.mp3'; // Som para botões clicados
import victorySoundFile from './sounds/victory.mp3'; // Som de vitória

function App() {
  return (
    <div className="App">
      <header className="game-header">
        <h1>Jogo de Reflexo e Velocidade</h1>
      </header>
      <GameBoard />
    </div>
  );
}

function GameBoard() {
  const [sequence, setSequence] = useState(1); // Sequência atual
  const [timeLeft, setTimeLeft] = useState(15); // Tempo restante (segundos)
  const [positions, setPositions] = useState(generateInitialPositions([1, 2, 3, 4])); // Posições aleatórias iniciais
  const [visibleNumbers, setVisibleNumbers] = useState([1, 2, 3, 4]); // Números visíveis na tela
  const [gameOver, setGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState(""); // Status do jogo

  // Reduz o tempo restante a cada segundo
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      playSound(explosionSoundFile, 0.2);
      setGameOver(true);
      setGameStatus("Você perdeu! A bomba explodiu 💥");
    }
  }, [timeLeft, gameOver]);

  // Reiniciar o jogo
  const resetGame = () => {
    setSequence(1);
    setTimeLeft(15);
    setPositions(generateInitialPositions([1, 2, 3, 4]));
    setVisibleNumbers([1, 2, 3, 4]);
    setGameOver(false);
    setGameStatus("");
  };

  // Reproduz som genérico
  const playSound = (soundFile, volume = 1.0) => {
    const audio = new Audio(soundFile);
    audio.volume = volume; // Define o volume do som
    audio.play();
  };

  // Lógica para lidar com cliques nos botões
  const handleButtonClick = (number) => {
    if (number === sequence) {
      playSound(buttonClickSoundFile, 1.0); // Som ao clicar corretamente com volume aumentado

      // Sequência correta
      if (sequence === 20) {
        playSound(victorySoundFile); // Som de vitória
        setGameOver(true);
        setGameStatus("Você venceu! 🎉");
      } else {
        setSequence(sequence + 1);

        // Atualiza os números visíveis e as posições
        const nextNumbers = visibleNumbers
          .filter((n) => n !== number) // Remove o número clicado
          .concat(sequence + 4) // Adiciona o próximo número na sequência
          .filter((n) => n <= 20); // Garante que não passe de 20

        // Mantém posições existentes e adiciona uma nova
        setPositions((prevPositions) => {
          const newPositions = { ...prevPositions };
          if (sequence + 4 <= 20) {
            newPositions[sequence + 4] = generateNewPosition(Object.values(prevPositions));
          }
          return newPositions;
        });

        setVisibleNumbers(nextNumbers);
      }
    } else {
      // Sequência errada
      playSound(explosionSoundFile, 0.2);
      setGameOver(true);
      setGameStatus("Você perdeu! A bomba explodiu 💥");
    }
  };

  return (
    <div className="game-board">
      {gameOver ? (
        <div className="game-over">
          <h2>{gameStatus}</h2>
          <button onClick={resetGame}>Reiniciar</button>
        </div>
      ) : (
        <div>
          <h2>Pressione: {sequence}</h2>
          <Timer timeLeft={timeLeft} />
          <div className="button-container">
            {visibleNumbers.map((number) => (
              <Button
                key={number}
                number={number}
                position={positions[number]}
                onClick={() => handleButtonClick(number)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Button({ number, position, onClick }) {
  const style = {
    position: 'absolute',
    top: `${position.top}%`,
    left: `${position.left}%`,
  };
  return (
    <button className="game-button" style={style} onClick={onClick}>
      {number}
    </button>
  );
}

function Timer({ timeLeft }) {
  return <div className="timer">⏳ Tempo restante: {timeLeft}s</div>;
}

function generateInitialPositions(numbers) {
  const positions = {};
  numbers.forEach((number) => {
    positions[number] = generateNewPosition(Object.values(positions));
  });
  return positions;
}

function generateNewPosition(existingPositions) {
  let newPosition;
  const reservedArea = { top: 20, bottom: 70 }; // Topo reservado para título e área centralizada
  do {
    newPosition = {
      top: Math.random() * (reservedArea.bottom - reservedArea.top) + reservedArea.top, // Garante que fique na área centralizada
      left: Math.random() * 80 + 10,
    };
  } while (
    existingPositions.some((pos) => {
      const dx = pos.left - newPosition.left;
      const dy = pos.top - newPosition.top;
      return Math.sqrt(dx * dx + dy * dy) < 10; // Distância mínima entre os botões
    })
  );
  return newPosition;
}

export default App;