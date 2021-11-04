import './stylesheets/style.css';


$(Main);

let songsList = null, ci = 0;

const audioQuality = "max";

let loadedurl = false;


let serverInfo = new URL('https://localhost:3000/');
serverInfo.host = "localhost";
serverInfo.port = "8080";
serverInfo.protocol = "http";
console.log(serverInfo);


async function Main(){

	let songs = await loadSongs();
	// console.log(songs);
	// await playSong();
	hideLoader();
};

function hideLoader(){
	hideEl($(".loader")); hideEl($(".music-app"), true);
}

function showLoader(){
	hideEl($(".loader"), true); hideEl($(".music-app"));
}

$("#next").click(function(){
	playNext();
});

$("#previous").click(function(){
	playPrev();
});

function playNext(){
	stopMusic();
	loadedurl = false;
	if(ci < songsList.length-1) ci++;
	else ci = 0;
	playMusic();
}
function playPrev(){
	loadedurl = false;
	if(ci>0) ci--;
	else ci = songsList.length-1;
	playMusic();
}

function chooseQuality(songflist){
	// stopMusic();
	if(audioQuality == "max"){
		return songflist[songflist.length-1];
	}else if(audioQuality == "min"){
		return songflist[0];
	}
	return songflist[songflist.length-1];
}

async function loadSong(){
	showLoader();
	let {flt,thumbnails} = await getYtSongDetail(songsList[ci]);
	// console.log(thumbnails,thumbnails.pop().url)
	let songd = chooseQuality(flt);
	$("img.cover").prop('src', thumbnails.pop().url)
	hideLoader();
	loadedurl = true;
	$("#audioplayer").attr("src",songd.url);
}


function hideEl($el,f=false){
	return $el.css("visibility",!f?"hidden":"visible");
}

function getYtSongDetail(ytUrl){
	return new Promise((res,rej)=>{
		$.post(serverInfo.toString() + "getYtSongDetail", {ytUrl}, function(data){
			let flt = data.formats
				.filter(x=>x.mimeType.startsWith("audio/"))
				.sort((x,y)=>x.audioBitrate-y.audioBitrate);
			res({flt, thumbnails: data.videoDetails.thumbnails});
		});
	})
}

function loadSongs(songs){
	return new Promise((res,rej)=>{
		$.get(serverInfo.toString()+"getMusicList?playlist="+encodeURI('https://www.youtube.com/playlist?list=PLsFgdBwHAdmY1GmdwH3DhCk8BX8ND4-tl'), function(data){
			songsList = data;
			res(data);
		});
	})
}




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
	await loadSong();
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



