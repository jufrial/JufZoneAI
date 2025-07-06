
const terminal = document.getElementById("terminal");
const input = document.getElementById("input");
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const userInput = input.value.trim();
    terminal.value += "\n> " + userInput;
    fetch("/data/brain.txt")
      .then((res) => res.text())
      .then((data) => {
        const lines = data.split("\n");
        let response = "Aku tidak tahu jawabannya.";
        for (let line of lines) {
          const [key, value] = line.split(":");
          if (userInput.toLowerCase().includes(key.toLowerCase())) {
            response = value.trim();
            break;
          }
        }
        terminal.value += "\n" + response;
        input.value = "";
        terminal.scrollTop = terminal.scrollHeight;
      });
  }
});
