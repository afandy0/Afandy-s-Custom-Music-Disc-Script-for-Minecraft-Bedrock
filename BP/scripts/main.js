import { Block, ItemStack, Player, system, world } from "@minecraft/server"

world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
    const player = e.player
    if (player.isSneaking == false) {
        CustomMusicFunction.PlayMusic(e.block.center(), e.itemStack, e.block, e.player)
    }
})
world.beforeEvents.playerBreakBlock.subscribe((data) => {
    const block = data.block
    if (block.typeId == "minecraft:jukebox") {
        CustomMusicFunction.BreakJukebox(data.block.center(), data.itemStack, data.block, data.player)
    }
})
class MusicItemOptions {
    DiscItemTypeId = undefined
    /**
     * This determines the blocks that can play the sound
     */
    JukeBoxTypes = []
    /**
     * Sound To Play
     */
    SoundId = ""
    /**
     * @type {import("@minecraft/server").WorldSoundOptions}
     */
    SoundOptions = undefined
    DropItemOffset = undefined
    DisplayText = undefined
    /**
     * 
     * @param {MusicItemOptions} MusicItemOption 
     */
    constructor(MusicItemOption) {
        if (MusicItemOption)
            Object.assign(this, MusicItemOption)
        return this
    }
}

class CustomMusicFunctions {
    MusicItems = {}
    /**
     * @description This function will be used to add a music disc/item 
     * @param {MusicItemOptions} MusicItemOption 
     */
    AddMusicItem(MusicItemOption) {
        if (this.MusicItems[MusicItemOption.DiscItemTypeId])
            console.warn(`Overwritten -> ${MusicItemOption.DiscItemTypeId}, item already had assigned blocks`)
        this.MusicItems[MusicItemOption.DiscItemTypeId] = MusicItemOption
        return this
    }

    /**
     * @description This function will only be used when interacting with a certain block
     * @param {import("@minecraft/server").Vector3} location 
     * @param {ItemStack} itemStack 
     * @param {Block} block 
     * @param {Player} player 
     */
    PlayMusic(location, itemStack, block, player) {
        let HasMusic = this.GetPlayingMusic(location)
        if (HasMusic)
            return this.DropDisc(location, player)
        if (!itemStack) return
        let Music = this.GetMusicItem(itemStack.typeId)
        if (!Music) return
        if (!Music.JukeBoxTypes.includes(block.typeId)) return
        system.run(() => {
            world.setDynamicProperty(`${JSON.stringify(location)}`, `${JSON.stringify(Music)}`)
            world.playSound(Music.SoundId, location, Music.SoundOptions)
            player.runCommandAsync("replaceitem entity @s slot.weapon.mainhand 0 minecraft:air")
            if (Music.DisplayText)
                player.onScreenDisplay.setActionBar(Music.DisplayText)
        })

    }

    BreakJukebox(location, itemStack, block, player) {
        let HasMusic = this.GetPlayingMusic(location)
        if (HasMusic)
            return this.DropDisc(location, player)
    }

    /**
     * @description This function will return the music item 
     * @returns {MusicItemOptions | undefined}
     */
    GetMusicItem(itemTypeId) {
        return this.MusicItems[itemTypeId]
    }

    /**
     * @param {import("@minecraft/server").Vector3} location 
     * @returns {MusicItemOptions}
     */
    GetPlayingMusic(location) {
        return (world.getDynamicProperty(`${JSON.stringify(location)}`) ?? false)
    }

    /**
     * @description This function will drop the disc/item 
     * @param {import("@minecraft/server").Vector3} location 
     */
    DropDisc(location, player) {
        let HasMusic = this.GetPlayingMusic(location)
        let dimension = seprateDimensionId(player.dimension.id)
        if (!HasMusic) return
        HasMusic = JSON.parse(HasMusic)
        HasMusic.DropItemOffset = HasMusic.DropItemOffset || [0, 1, 0]
        system.run(() => {
            world.getDimension(dimension).runCommandAsync(`stopsound @a ${HasMusic.SoundId}`)
            world.getDimension(dimension).spawnItem(new ItemStack(HasMusic.DiscItemTypeId, 1), { x: location.x + (HasMusic.DropItemOffset[0]), y: location.y + (HasMusic.DropItemOffset[1]), z: location.z + (HasMusic.DropItemOffset[2]) })
            world.setDynamicProperty(`${JSON.stringify(location)}`)
        })

    }
}
function seprateDimensionId(inputString) {
    // Split the string by the colon delimiter and return the last segment
    const segments = inputString.split(':');
    return segments[segments.length - 1];
}
export const CustomMusicFunction = new CustomMusicFunctions()



//Example Items Being Used as Discs
CustomMusicFunction.AddMusicItem({
    DiscItemTypeId: "minecraft:bread",
    SoundId: "record.cat",
    DropItemOffset: [0, 1, 0],
    JukeBoxTypes: [
        "minecraft:jukebox"
    ],
    DisplayText: "Playing My Music"
}).AddMusicItem({
    DiscItemTypeId: "afm:all_my_fellas_disc",
    SoundId: "allMyFellas",
    DropItemOffset: [0, 1, 0],
    SoundOptions: {
        volume: 0.2,
        pitch: 1
    },
    JukeBoxTypes: [
        "minecraft:jukebox"
    ],
    DisplayText: "Playing All My Fellas"
}).AddMusicItem({
    DiscItemTypeId: "minecraft:apple",
    SoundId: "allMyFellas",
    DropItemOffset: [0, 1, 0],
    SoundOptions: {
        volume: 0.2,
        pitch: 1
    },
    JukeBoxTypes: [
        "minecraft:jukebox"
    ],
    DisplayText: "Playing All My Fellas"
})