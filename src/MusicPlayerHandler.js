

var btnPlay = document.getElementById("play");
var btnStop = document.getElementById("stop");
var btnReplay = document.getElementById("replay");
//Image
var cover = document.querySelector(".cover");
//Element audio
var audio = document.getElementById("audioplayer");
//Icon play and pause
var icon = document.querySelector("#play .icons");
//Progress Bar
var progressBar = document.getElementById("progress-bar");
var progress = document.getElementById("progress");

var count = 0;
let playing = false;

async function playMusic() {
	if(loadedurl == false){
		await loadSong();
	}
	cover.setAttribute("class", "play");
	icon.setAttribute("class", "fas fa-pause");
	audio.play();
	playing = true;
	//Count the clicks
	count += 1;
}

//---------------- Play music
btnPlay.addEventListener("click", () => {
	if(playing == false){
		playMusic();
	}else {
		pauseMusic();
	}
});

function pauseMusic(){
	cover.setAttribute("class", "cover");
	icon.setAttribute("class", "fas fa-play");
	audio.pause();
	playing = false;
}

//---------------- Stop music
btnStop.addEventListener("click", () => {
	stopMusic();
	count = 0;
});

//---------------- Replay music
btnReplay.addEventListener("click", () => {
	var time = audio.currentTime;
	var replay_10 = time - 10;
	audio.currentTime = replay_10;
});

//---------------- Audio

audio.addEventListener("ended", function () {
	console.log("Song ended");
	$(".btn-nextt").trigger('click')
})
audio.addEventListener("timeupdate", function () {
	//Time
	var duration = audio.duration;
	if(Number.isNaN(duration)) return;
	var currentTime = audio.currentTime;
	document.getElementById("duration").innerHTML = convertElapsedTime(duration);
	document.getElementById("current-time").innerHTML = convertElapsedTime(
		currentTime
	);
	//Progress Bar
	progress.style.width = (currentTime / duration) * 100 + "%";

	//Stop when audio ends
	if (currentTime >= duration) {
		stopMusic();
	}
});

//---------------- Control of the progress
progressBar.addEventListener("mousedown", function (event) {
	var clickedPosition = event.clientX - event.target.offsetLeft;
	audio.currentTime =
		(clickedPosition / event.target.offsetWidth) * audio.duration;
});

//Convert
function convertElapsedTime(inputSeconds) {
	// console.log(inputSeconds)
	var seconds = Math.floor(inputSeconds % 60);
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var minutes = Math.floor(inputSeconds / 60);
	return minutes + ":" + seconds;
}

//Function stop
function stopMusic() {
	audio.pause();
	audio.currentTime = 0;
	icon.setAttribute("class", "fas fa-play");
	cover.setAttribute("class", "cover");
}

