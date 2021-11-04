import './stylesheets/Music.css';
import './stylesheets/style.css';
import $ from 'jquery';



$(Main);

let songsList = null, ci = 0, audioQuality = "max";
let loadedurl = false;
//music server
let serverInfo = new URL('http://localhost:8080/');
let production = true;
if(production){
	serverInfo.host = "mewsicserver.herokuapp.com";
	serverInfo.port = "443";
	serverInfo.protocol = "https";
}


let uhand = new URL(location.href);
let toHandle = {
	playlist: uhand.searchParams.get('playlist'),
	song: uhand.searchParams.get('song')
};

async function Main(){
	console.log(toHandle)
	if(toHandle.playlist) songsList = await loadSongs();
	else if(toHandle.song) songsList = [toHandle.song];

	console.log(songsList);
	hideLoader();
};

const hideEl = ($el,f=false)=> f?$el.removeClass('hidden'):$el.addClass('hidden');

const showLoader = ()=> [hideEl($(".loader"), true), hideEl($(".music-app"))];
const hideLoader = ()=> [hideEl($(".loader")), hideEl($(".music-app"), true)];



$("#next").click(()=>playNext());
$("#previous").click(()=>playPrev());

const playNext = ()=> {
	stopMusic();
	loadedurl = false;
	if(ci < songsList.length-1) ci++;
	else ci = 0;
	playMusic();
}
const playPrev = ()=>{
	loadedurl = false;
	if(ci>0) ci--;
	else ci = songsList.length-1;
	playMusic();
}

const chooseQuality = songflist=>{
	if(audioQuality == "max") return songflist[songflist.length-1];
	else if(audioQuality == "min") return songflist[0];
	return songflist[songflist.length-1];
}

const loadSong = async ()=>{
	showLoader();
	let {flt,thumbnails} = await getYtSongDetail(songsList[ci]);
	let songd = chooseQuality(flt);
	$("img.cover").prop('src', thumbnails.pop().url);
	hideLoader();
	loadedurl = true;
	$("#audioplayer").attr("src",songd.url);
}




const getYtSongDetail = (ytUrl)=>{
	return new Promise((res,rej)=>{
		$.get((new URL("/getYtSongDetail", serverInfo)).toString(), {ytUrl}, function(data){
			let flt = data.formats
				.filter(x=>x.mimeType.startsWith("audio/"))
				.sort((x,y)=>x.audioBitrate-y.audioBitrate);
			res({flt, thumbnails: data.videoDetails.thumbnails});
		});
	})
}

const loadSongs = function (songs){
	return new Promise((res,rej)=>{
		$.get((new URL("/getMusicList?playlist=" + encodeURI(toHandle.playlist),serverInfo)).toString(),
			data=>res(data));
	})
}


let cover = $(".cover")[0];
let audio = $("#audioplayer")[0];
let icon = $("#play .icons")[0];

let count = 0;
let playing = false;

const playMusic = async ()=> {
	if(!loadedurl) await loadSong();
	cover.setAttribute("class", "play");
	icon.setAttribute("class", "fas fa-pause");
	audio.play(); playing = true; count += 1;
}


const pauseMusic = ()=>{
	cover.setAttribute("class", "cover");
	icon.setAttribute("class", "fas fa-play");
	audio.pause();
	playing = false;
}

$("#play").click(() => playing?pauseMusic():playMusic());
$("#stop").click(() => [[stopMusic(),count = 0]]);
$("#replay").click(() => audio.currentTime = audio.currentTime - 10);


$(audio).on("ended", ()=> $(".btn-nextt").trigger('click'));

$(audio).on("timeupdate", ()=> {
	if(Number.isNaN(audio.duration)) return;
	$("#duration")[0].innerHTML = convertElapsedTime(audio.duration);
	$("#current-time")[0].innerHTML = convertElapsedTime(audio.currentTime);
	$("#progress")[0].style.width = (audio.currentTime / audio.duration) * 100 + "%";
	if (audio.currentTime >= audio.duration) stopMusic();
});


$("#progress-bar").on("mousedown", (event)=> {
	audio.currentTime =
		((event.clientX - event.target.offsetLeft) / event.target.offsetWidth) * audio.duration;
});	


const convertElapsedTime = (inputSeconds)=> {
	let seconds = Math.floor(inputSeconds % 60);
	if (seconds < 10) seconds = "0" + seconds;
	let minutes = Math.floor(inputSeconds / 60);
	return minutes + ":" + seconds;
}


const stopMusic = () => {
	audio.pause();
	audio.currentTime = 0;
	icon.setAttribute("class", "fas fa-play");
	cover.setAttribute("class", "cover");
}



