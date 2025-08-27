import { Block, ItemStack, system, world } from "@minecraft/server"

world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
    const { block, player, itemStack } = data

    if (block.typeId !== "minecraft:jukebox") return

    // Prevent concurrent interactions by checking and setting a lock
    const locationKey = JSON.stringify(block.center())
    const isLocked = world.getDynamicProperty(`lock:${locationKey}`)
    if (isLocked) return // Ignore if jukebox is busy

    // Set lock to block rapid interactions
    world.setDynamicProperty(`lock:${locationKey}`, true)

    const alreadyPlaying = CustomMusicFunction.GetPlayingMusic(block.center())
    if (itemStack) {
        let music = CustomMusicFunction.GetMusicItem(itemStack.typeId)
        if (music && music.JukeBoxTypes.includes(block.typeId)) {
            if (!player.isSneaking) {
                CustomMusicFunction.PlayMusic(block.center(), itemStack, block, player)
            } else {
                // Clear lock if sneaking
                system.run(() => {
                    world.setDynamicProperty(`lock:${locationKey}`)
                })
            }
        } else {
            // Clear lock if item is not a valid music disc
            system.run(() => {
                world.setDynamicProperty(`lock:${locationKey}`)
            })
        }
    } else { // Empty hand interaction
        CustomMusicFunction.PlayMusic(block.center(), itemStack, block, player)
    }
})


world.beforeEvents.playerBreakBlock.subscribe((data) => {
    const block = data.block
    if (block.typeId === "minecraft:jukebox") {
        const locationKey = JSON.stringify(block.center())
        // Clear lock and drop disc if music is playing
        world.setDynamicProperty(`lock:${locationKey}`)
        CustomMusicFunction.BreakJukebox(data.block.center(), data.itemStack, data.block, data.player)
    }
})

// Define options for custom music discs
class MusicItemOptions {
    DiscItemTypeId = undefined // Item ID for the music disc
    JukeBoxTypes = [] // Blocks that can play the disc
    SoundId = "" // Sound to play
    SoundOptions = undefined // Sound settings (volume, pitch)
    DropItemOffset = undefined // Position offset for dropped disc
    DisplayText = undefined // Text shown when music plays

    constructor(MusicItemOption) {
        if (MusicItemOption) {
            Object.assign(this, MusicItemOption) // Copy provided options
        }
        return this
    }
}

// Manage custom music disc functionality
class CustomMusicFunctions {
    MusicItems = {} // Store registered music discs

    // Register a new music disc
    AddMusicItem(MusicItemOption) {
        if (this.MusicItems[MusicItemOption.DiscItemTypeId]) {
            console.warn(`Overwritten -> ${MusicItemOption.DiscItemTypeId}, item already had assigned blocks`)
        }
        this.MusicItems[MusicItemOption.DiscItemTypeId] = MusicItemOption
        return this
    }

    // Play music or eject disc when interacting with a jukebox
    PlayMusic(location, itemStack, block, player) {
        const locationKey = JSON.stringify(location)
        let HasMusic = this.GetPlayingMusic(location)
        if (HasMusic) {
            // Eject disc if music is already playing
            this.DropDisc(location, player)
            return
        }

        if (!itemStack) {
            // Clear lock for empty hand with no music
            system.run(() => {
                world.setDynamicProperty(`lock:${locationKey}`)
            })
            return
        }

        let Music = this.GetMusicItem(itemStack.typeId)
        if (!Music || !Music.JukeBoxTypes.includes(block.typeId)) {
            // Clear lock if item or block is invalid
            system.run(() => {
                world.setDynamicProperty(`lock:${locationKey}`)
            })
            return
        }

        // Set jukebox state
        world.setDynamicProperty(`${locationKey}`, `${JSON.stringify(Music)}`)

        // Update inventory and play music
        const inv = player.getComponent("minecraft:inventory").container
        const slot = player.selectedSlotIndex
        const current = inv.getItem(slot)

        system.run(() => {
            if (current && current.typeId === itemStack.typeId) {
                // Remove disc from inventory
                if (current.amount > 1) {
                    player.runCommandAsync(`replaceitem entity @s slot.hotbar ${slot} ${current.typeId} ${current.amount - 1}`).catch((err) => {
                        console.warn(`Failed to replace item: ${err}`)
                    })
                } else {
                    player.runCommandAsync(`replaceitem entity @s slot.hotbar ${slot} air`).catch((err) => {
                        console.warn(`Failed to clear slot: ${err}`)
                    })
                }
            }

            // Play sound and show display text
            world.playSound(Music.SoundId, location, Music.SoundOptions)
            if (Music.DisplayText) {
                player.onScreenDisplay.setActionBar(Music.DisplayText)
            }

            // Clear lock
            world.setDynamicProperty(`lock:${locationKey}`)
        })
    }

    // Handle jukebox breaking
    BreakJukebox(location, itemStack, block, player) {
        let HasMusic = this.GetPlayingMusic(location)
        if (HasMusic) {
            // Drop disc if music is playing
            this.DropDisc(location, player)
        }
    }

    // Get music item by item ID
    GetMusicItem(itemTypeId) {
        return this.MusicItems[itemTypeId]
    }

    // Check if music is playing at a location
    GetPlayingMusic(location) {
        return (world.getDynamicProperty(`${JSON.stringify(location)}`) ?? false)
    }

    // Drop disc when music stops or jukebox is broken
    DropDisc(location, player) {
        const locationKey = JSON.stringify(location)
        let HasMusic = this.GetPlayingMusic(location)
        let dimension = separateDimensionId(player.dimension.id)
        if (!HasMusic) {
            // Clear lock if no music is playing
            system.run(() => {
                world.setDynamicProperty(`lock:${locationKey}`)
            })
            return
        }

        HasMusic = JSON.parse(HasMusic)
        HasMusic.DropItemOffset = HasMusic.DropItemOffset || [0, 1, 0]

        system.run(() => {
            // Stop music and spawn disc
            world.getDimension(dimension).runCommandAsync(`stopsound @a ${HasMusic.SoundId}`)
            world.getDimension(dimension).spawnItem(new ItemStack(HasMusic.DiscItemTypeId, 1), {
                x: location.x + (HasMusic.DropItemOffset[0]),
                y: location.y + (HasMusic.DropItemOffset[1]),
                z: location.z + (HasMusic.DropItemOffset[2])
            })
            world.setDynamicProperty(`${locationKey}`)
            // Clear lock after disc is dropped
            world.setDynamicProperty(`lock:${locationKey}`)
        })
    }
}

// Extracts dimension ID from a string
function separateDimensionId(inputString) {
    const segments = inputString.split(':')
    return segments[segments.length - 1]
}

export const CustomMusicFunction = new CustomMusicFunctions()

// Example music discs (add your own here)
CustomMusicFunction.AddMusicItem({
    DiscItemTypeId: "minecraft:bread", // Item ID for the music disc
    SoundId: "record.cat", // Sound to play (from sound definitions)
    DropItemOffset: [0, 1, 0], // Where the disc drops relative to jukebox
    JukeBoxTypes: ["minecraft:jukebox"], // Blocks that can play this disc
    DisplayText: "Playing cat" // Text shown when music plays
}).AddMusicItem({
    DiscItemTypeId: "minecraft:oak_sapling",
    SoundId: "record.cat",
    DropItemOffset: [0, 1, 0],
    SoundOptions: {
        volume: 0.2,
        pitch: 1
    }, // Optional sound settings
    JukeBoxTypes: ["minecraft:jukebox"],
    DisplayText: "Playing cat"
}).AddMusicItem({
    DiscItemTypeId: "minecraft:apple",
    SoundId: "record.cat",
    DropItemOffset: [0, 1, 0],
    SoundOptions: {
        volume: 0.2,
        pitch: 1
    },
    JukeBoxTypes: ["minecraft:jukebox"],
    DisplayText: "Playing cat"
})
