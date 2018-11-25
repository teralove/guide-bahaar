String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const Vec3 = require('tera-vec3');
const config = require('./config.json');

const mapID = 9044;
const BossID = [1000, 2000];
const BossActions = {
//第一阶段//////////////////////////////////////////
	103: {msg: 'Front (Dodge)'},
    104: {msg: 'Front -> Back'},
	
    117: {msg: 'Front smash (res bait)??'},  // "Your clumbsy tricks cannot deceive me, mortal!" (Res bait?)            
	118: {msg: 'Front Jump'},

	108: {msg: 'Back Throw -> Front'},

	111: {msg0: 'After??? (Slow)'},
//	137: {msg: 'Back Smash'},

	131: {msg: 'Front -> Left Scratch -> Back Smash'},
	139: {msg: 'Circle'},

	121: {msg: 'Waves Left -> Get IN'},
	140: {msg: 'Waves Right -> Get IN'},

//	113: {msg: 'Throw'},
	114: {msg: 'Eviscerate'},
    115: {msg: 'Eviscerate (Knock up)?'},
    138: {msg: 'Eviscerate (Knock up)???'},  // "Your clumbsy tricks cannot deceive me, mortal!" (Res bait?)
       
        116: {msg: 'Donuts'},
    
        126: {msg: 'Front + Right scratch?'},
//			127: {msg: 'Right scratch'},
        311: {msg: 'Wrath + Right Swipe?'},
        120: {msg: 'Right swipe?'},
        
        307: {msg: 'Starting Bombs?'},
        301: {msg: 'Bombs?'},    
        
        305205: {msg: 'Ending bombs? + plague?'},        
        
//        309: {msg: 'Stun it 1'},
//        310: {msg: 'Stun it 2'},    

        101: {msg: 'Front bop + Right swing + Front smash + Get IN?'}, // Just the Front bop
        //105: {msg: 'Right swing.. 1???'},
        //107: {msg: 'Right swing.. 2???'},
        //105: {msg: 'Front smash???'},

        135: {msg: 'Front bop?'},

        306: {msg: 'Rocks'},
};

module.exports = function BaharrGuide(d) {
	let	enabled = config.enabled,
		sendToParty = config.sendToParty,
		streamenabled = config.streamenabled,

		isTank = false,
		insidemap = false,
		whichboss = 0,

		hooks = [],

		curLocation = null,
		curAngle = null,

		boss_CurLocation,
		boss_CurAngle,

		uid0 = 999999999,
		uid1 = 899999999,
		uid2 = 799999999,
        
        skillid = null,
        shining = false;

	d.command.add(['baha', 'bahaar'], (arg) => {
		if (!arg) {
			enabled = !enabled;
			d.command.message((enabled ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));
		} else {
			switch (arg) {
                case "on":
                    enabled = true;
                    d.command.message((enabled ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));
                    break;
                case "off":
                    enabled = false;
                    d.command.message((enabled ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));
                    break;                
				case "p":
				case "party":
					sendToParty = !sendToParty;
					d.command.message('Send to party: ' + (sendToParty ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));
					break;
				case "proxy":
                case "stream":
					streamenabled = !streamenabled;
					d.command.message('Stream mode: ' + (streamenabled ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')));
					break;
				case "debug":
					d.command.message('模块开关: ' + `${enabled}`.clr('00FFFF'));
					d.command.message('副本地图: ' + insidemap);
					d.command.message('副本首领: ' + whichboss);
					d.command.message('发送通知 ' + (sendToParty ? '真实组队'.clr('56B4E9') : '仅自己见'.clr('E69F00')));
					d.command.message('职业分类 ' + (isTank ? '坦克'.clr('00FFFF') : '打手'.clr('FF0000')));
					sendMessage('test');
					break;
				default :
					d.command.message('Invalid argument!'.clr('FF0000'));
					break;
			}
		}
	});

	d.hook('S_LOGIN', 10, sLogin)
	d.hook('S_LOAD_TOPO', 3, sLoadTopo);

	function sLogin(event) {
		let job = (event.templateId - 10101) % 100;
		if (job === 1 || job === 10) {
			isTank = true;
		} else {
			isTank = false;
		}
	}

	function sLoadTopo(event) {
		if (event.zone === mapID) {
			insidemap = true;
			d.command.message('Welcome to ' + 'Bahaar\'s Sanctum '.clr('56B4E9'));
			load();
		} else {
			unload();
		}
    }

	function load() {
		if (!hooks.length) {

			hook('S_BOSS_GAGE_INFO', 3, sBossGageInfo);
			hook('S_ACTION_STAGE', 8, sActionStage);
            hook('S_ABNORMALITY_BEGIN', 3, sAbnormalityBegin);

			function sBossGageInfo(event) {
				if (!insidemap) return;
			}

			function sActionStage(event) {
				if (!enabled || !insidemap || event.stage>0) return;
                if (!BossID.includes(event.templateId)) return;

				skillid = event.skill.id % 1000;
				
				boss_CurLocation = event.loc;
				boss_CurAngle = event.w;
				
				curLocation = boss_CurLocation;
				curAngle = boss_CurAngle;

				if (event.stage==1 && skillid==104) {
					setTimeout(function() { 
						if (shining) sendMessage('发光后砸104');
					}, 1000)
				}
				if (event.stage==1 && skillid==118) {
					setTimeout(function() { 
						if (shining) sendMessage('发光后砸118');
					}, 2000)
				}
				if (event.stage==0 && skillid==134) {
					setTimeout(function() { 
						if (shining) sendMessage('发光后砸134');
					}, 1000)
				}

				if (event.stage==0 && BossActions[skillid]) {
					switch (skillid) {
						case 103:	// 前砸
							SpawnThing(184, 400, 100);
							Spawnitem2(581, 6, 350, 3000);
							break;
						case 131:	// 左前砸+后拉
							SpawnThing(182, 340, 100);
							Spawnitem2(581, 4, 660, 4000);
							break;
						case 114:	// 捶地
							SpawnThing(184, 260, 100);
							Spawnitem2(581, 10, 320, 4000);
							break;
						case 116:	// 点名后甜甜圈
							Spawnitem2(581, 8, 290, 6000);
							break;

						case 121:	// 左脚→(4连火焰)
						case 140:	// 右脚←(4连火焰)
							SpawnThing(90, 50, 100);
							Spawnitem1(581, 180, 500, 6000);
							Spawnitem1(581, 0, 500, 6000);

							SpawnThing(270, 100, 100);
							Spawnitem1(581, 180, 500, 6000);
							Spawnitem1(581, 0, 500, 6000);
							break;

						default :

							break;
					}
					sendMessage(BossActions[skillid].msg);
				}
			}

			function sAbnormalityBegin(event) {
				if (!enabled) return;
				if (event.id==90442000) shining = true;
				if (event.id==90442001) shining = false;
			}
		}
	}

	function hook() {
		hooks.push(d.hook(...arguments));
	}

	function unload() {
		if (hooks.length) {
			for (let h of hooks)
				d.unhook(h);
			hooks = [];
		}
		reset();
	}

	function reset() {
		insidemap = false,
		whichboss = 0;
	}

	function sendMessage(msg) {
		if (sendToParty) {
			d.toServer('C_CHAT', 1, {
				channel: 21,
				message: msg
			});
		} else if (streamenabled) {
			d.command.message(msg);
		} else {
			d.toClient('S_CHAT', 2, {
				channel: 21,
				authorName: 'DG-Guide',
				message: msg
			});
		}
	}

	function SpawnThing(degrees, radius, times) {
        if (streamenabled) return;
		let r = null, rads = null, finalrad = null;

		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		curLocation.x = boss_CurLocation.x + radius * Math.cos(finalrad);
		curLocation.y = boss_CurLocation.y + radius * Math.sin(finalrad);

		d.toClient('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : uid1,
			itemId : 1,
			loc : curLocation,
			w : r,
			unk : 0,
			ownerName : 'DG-Guide',
			message : 'Safe'
		});

		curLocation.z = curLocation.z - 1000;
		d.toClient('S_SPAWN_DROPITEM', 6, {
			gameId: uid2,
			item: 98260,
			loc: curLocation,
			amount: 1,
			expiry: 600000,
			owners: [{
				id: 0
			}]
		});
		curLocation.z = curLocation.z + 1000;

		setTimeout(DespawnThing, times, uid1, uid2);
		uid1--;
		uid2--;
	}

	function DespawnThing(uid_arg1, uid_arg2) {
		d.toClient('S_DESPAWN_BUILD_OBJECT', 2, {
			gameId : uid_arg1,
			unk : 0
		});
		d.toClient('S_DESPAWN_DROPITEM', 4, {
			gameId: uid_arg2
		});
	}

	function Spawnitem(item, degrees, radius, times) {
        if (streamenabled) return;
		let r = null, rads = null, finalrad = null, spawnx = null, spawny = null, pos = null;

		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = curLocation.x + radius * Math.cos(finalrad);
		spawny = curLocation.y + radius * Math.sin(finalrad);
		pos = {x:spawnx, y:spawny};

		d.toClient('S_SPAWN_COLLECTION', 4, {
			gameId : uid0,
			id : item,
			amount : 1,
			loc : new Vec3(pos.x, pos.y, curLocation.z),
			w : r,
			unk1 : 0,
			unk2 : 0
		});

		setTimeout(Despawn, times, uid0);
		uid0--;
	}

	function Despawn(uid_arg0) {
		d.toClient('S_DESPAWN_COLLECTION', 2, {
			gameId : uid_arg0
		});
	}

	function Spawnitem1(item, degrees, maxRadius, times) {
		for (var radius=25; radius<=maxRadius; radius+=25) {
			Spawnitem(item, degrees, radius, times);
		}
	}

	function Spawnitem2(item, intervalDegrees, radius, times) {
		for (var degrees=0; degrees<360; degrees+=intervalDegrees) {
			Spawnitem(item, degrees, radius, times);
		}
	}

}
