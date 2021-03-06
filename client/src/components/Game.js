import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { socket } from "..";
import { setCurrentQuestion } from "../actions/game";
import { setScore } from "../actions/player";
import Footer from "./Footer";
import Header from "./Header";
import QuestionPreview from "./QuestionPreview";
import QuestionView from "./QuestionView";
import RoundEnd from "./RoundEnd";

const mapDispatchToProps = (dispatch) => {
  return {
    setScore: (score) => dispatch(setScore(score)),
    setCurrentQuestion: (currentQuestion) =>
      dispatch(setCurrentQuestion(currentQuestion)),
  };
};

const mapStateToProps = (state) => {
  return {
    name: state.player.name,
    score: state.player.score,
    currentQuestion: state.game.currentQuestion,
    totalQuestions: state.game.totalQuestions,
  };
};

const Game = ({
  name,
  score,
  currentQuestion,
  totalQuestions,
  setScore,
  setCurrentQuestion,
}) => {
  useEffect(() => {
    //Set the state with next question when it comes
    socket.on("nextQuestion", (question) => {
      setQuestion(question.question);
      setCurrentQuestion(currentQuestion + 1);
      setOptions(question.options);
      setGameState("questionPreview");
    });

    //If the server indicates that the round has ended
    socket.on("roundEnded", ({ playersData, correctAnswer, gameEnded }) => {
      //Get the current user
      const currentPlayer = playersData.find((x) => x.playerId === socket.id);

      //Get the top five leaderboard
      const topFive = playersData.slice(0, 5);

      setIsCorrect(currentPlayer.correct);
      setScore(currentPlayer.score);
      setPosition(currentPlayer.position);
      setCorrectAnswer(correctAnswer);
      setLeaderboard(topFive);
      setGameEnded(gameEnded);
      setGameState("roundEnd");
    });
  }, [currentQuestion, setCurrentQuestion, setScore]);

  //Game State
  const [gameState, setGameState] = useState("");
  const [gameEnded, setGameEnded] = useState(false);

  //Question Config
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState("");
  const [position, setPosition] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  return (
    <Box sx={{ padding: "5vh 0" }}>
      <Header
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
      />
      {gameState === "questionPreview" && (
        <QuestionPreview question={question} setGameState={setGameState} />
      )}
      {gameState === "questionView" && (
        <QuestionView question={question} options={options} />
      )}
      {gameState === "roundEnd" && (
        <RoundEnd
          isCorrect={isCorrect}
          correctAnswer={correctAnswer}
          position={position}
          leaderboard={leaderboard}
          gameEnded={gameEnded}
        />
      )}
      <Footer name={name} score={score} />
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
