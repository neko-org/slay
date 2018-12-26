module.exports = function Slay(mod) {
	const {command} = mod.require

	let gameId = -1n,
		isCastanic = false,
		location = null,
		locRealTime = 0,
		curHp = 0,
		maxHp = 0

	mod.hook('S_LOGIN', 12, event => {
		({gameId} = event)
		isCastanic = Math.floor((event.templateId - 10101) / 200) === 3
	})

	mod.hook('S_PLAYER_STAT_UPDATE', 10, event => {
		curHp = Number(event.hp)
		maxHp = Number(event.maxHp)
	})

	mod.hook('S_CREATURE_CHANGE_HP', 6, event => {
		if(event.target === gameId) {
			curHp = Number(event.curHp)
			maxHp = Number(event.maxHp)
		}
	})

	mod.hook('C_PLAYER_LOCATION', 5, event => {
		location = event
		locRealTime = Date.now()
	})

	command.add(['drop', 'slay', 'slaying'], percent => {
		percent = Number(percent)

		if(!(percent > 0 && percent <= 100) || !curHp) return

		const percentToDrop = curHp * 100 / maxHp - percent

		if(percentToDrop <= 0) return

		mod.send('C_PLAYER_LOCATION', 5, Object.assign({}, location, {
			loc: location.loc.addN({z: 400 + percentToDrop*(isCastanic ? 20 : 10)}),
			type: 2,
			time: location.time - locRealTime + Date.now() - 50
		}))
		mod.send('C_PLAYER_LOCATION', 5, Object.assign(location, {
			type: 7,
			time: location.time - locRealTime + Date.now() + 50
		}))
	})
}