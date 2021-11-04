



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
	console.log(thumbnails,thumbnails.pop().url)
	let songd = chooseQuality(flt);
	$("img.cover").prop('src', thumbnails.pop().url)
	hideLoader();
	loadedurl = true;
	console.log(songd.url)
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
			console.log(flt)
			res({flt, thumbnails: data.videoDetails.thumbnails});
		});
	})
}

function loadSongs(songs){
	return new Promise((res,rej)=>{
		$.get(serverInfo.toString()+"getMusicList", function(data){
			songsList = data;
			res(data);
		});
	})
}