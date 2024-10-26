import { Block, ItemStack, Player, system, world } from "@minecraft/server"

// Subscribe to the player interaction event with a block
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
    const player = e.player
    // Check if the player is not sneaking
    if (!player.isSneaking) {
        // Play music when interacting with a jukebox using a music disc
        CustomMusicFunction.PlayMusic(e.block.center(), e.itemStack, e.block, e.player)
    }
})

// Subscribe to the player breaking a block event
world.beforeEvents.playerBreakBlock.subscribe((data) => {
    const block = data.block
    // Check if the broken block is a jukebox
    if (block.typeId === "minecraft:jukebox") {
        // Handle the breaking of the jukebox and drop the music disc if applicable
        CustomMusicFunction.BreakJukebox(data.block.center(), data.itemStack, data.block, data.player)
    }
})

// Class to define options for music items
class MusicItemOptions {
    // Item ID for the music disc
    DiscItemTypeId = undefined
    // Blocks that can play the sound
    JukeBoxTypes = []
    // Sound to play
    SoundId = ""
    // Sound options (volume, pitch, etc.)
    SoundOptions = undefined
    // Offset for item drop position
    DropItemOffset = undefined
    // Display text when the music is played
    DisplayText = undefined
    
    /**
     * Constructor to initialize MusicItemOptions
     * @param {MusicItemOptions} MusicItemOption 
     */
    constructor(MusicItemOption) {
        if (MusicItemOption) {
            Object.assign(this, MusicItemOption) // Assign options
        }
        return this
    }
}

// Class to handle custom music functions
class CustomMusicFunctions {
    // Store all custom music items
    MusicItems = {}

    /**
     * Adds a custom music item
     * @param {MusicItemOptions} MusicItemOption 
     */
    AddMusicItem(MusicItemOption) {
        if (this.MusicItems[MusicItemOption.DiscItemTypeId]) {
            console.warn(`Overwritten -> ${MusicItemOption.DiscItemTypeId}, item already had assigned blocks`)
        }
        this.MusicItems[MusicItemOption.DiscItemTypeId] = MusicItemOption // Add or overwrite music item
        return this
    }

    /**
     * Play music when interacting with a jukebox
     * @param {import("@minecraft/server").Vector3} location 
     * @param {ItemStack} itemStack 
     * @param {Block} block 
     * @param {Player} player 
     */
    PlayMusic(location, itemStack, block, player) {
        let HasMusic = this.GetPlayingMusic(location) // Check if music is already playing
        if (HasMusic) return this.DropDisc(location, player) // If music is playing, drop the disc

        if (!itemStack) return // Ensure item stack is valid
        let Music = this.GetMusicItem(itemStack.typeId) // Get music item from the item stack
        if (!Music) return // If not a valid music item, exit
        if (!Music.JukeBoxTypes.includes(block.typeId)) return // Check if block can play this music
        
        system.run(() => {
            // Set dynamic property to track the playing music
            world.setDynamicProperty(`${JSON.stringify(location)}`, `${JSON.stringify(Music)}`)
            // Play the specified sound
            world.playSound(Music.SoundId, location, Music.SoundOptions)
            // Remove the music disc from the player's hand
            player.runCommandAsync("replaceitem entity @s slot.weapon.mainhand 0 minecraft:air")
            if (Music.DisplayText) {
                player.onScreenDisplay.setActionBar(Music.DisplayText) // Show display text
            }
        })
    }

    /**
     * Handle breaking a jukebox
     * @param {import("@minecraft/server").Vector3} location 
     * @param {ItemStack} itemStack 
     * @param {Block} block 
     * @param {Player} player 
     */
    BreakJukebox(location, itemStack, block, player) {
        let HasMusic = this.GetPlayingMusic(location) // Check if music is playing
        if (HasMusic) return this.DropDisc(location, player) // Drop the disc if music is playing
    }

    /**
     * Retrieve a music item based on its ID
     * @param {string} itemTypeId 
     * @returns {MusicItemOptions | undefined}
     */
    GetMusicItem(itemTypeId) {
        return this.MusicItems[itemTypeId] // Return the music item or undefined
    }

    /**
     * Check if music is playing at the specified location
     * @param {import("@minecraft/server").Vector3} location 
     * @returns {MusicItemOptions}
     */
    GetPlayingMusic(location) {
        return (world.getDynamicProperty(`${JSON.stringify(location)}`) ?? false) // Get dynamic property for music
    }

    /**
     * Drop the music disc when breaking the jukebox
     * @param {import("@minecraft/server").Vector3} location 
     */
    DropDisc(location, player) {
        let HasMusic = this.GetPlayingMusic(location) // Check if music is playing
        let dimension = separateDimensionId(player.dimension.id) // Get the dimension ID
        if (!HasMusic) return // Exit if no music is playing
        HasMusic = JSON.parse(HasMusic) // Parse the music details
        HasMusic.DropItemOffset = HasMusic.DropItemOffset || [0, 1, 0] // Set drop offset

        system.run(() => {
            // Stop the music sound for all players
            world.getDimension(dimension).runCommandAsync(`stopsound @a ${HasMusic.SoundId}`)
            // Spawn the music disc at the specified drop position
            world.getDimension(dimension).spawnItem(new ItemStack(HasMusic.DiscItemTypeId, 1), {
                x: location.x + (HasMusic.DropItemOffset[0]),
                y: location.y + (HasMusic.DropItemOffset[1]),
                z: location.z + (HasMusic.DropItemOffset[2])
            })
            world.setDynamicProperty(`${JSON.stringify(location)}`) // Clear the dynamic property
        })
    }
}

/**
 * Helper function to extract the dimension ID from a string
 * @param {string} inputString 
 * @returns {string}
 */
function separateDimensionId(inputString) {
    const segments = inputString.split(':'); // Split the string by the colon delimiter
    return segments[segments.length - 1]; // Return the last segment as the dimension ID
}

// Initialize the custom music functions
export const CustomMusicFunction = new CustomMusicFunctions()

// Example music discs being defined
CustomMusicFunction.AddMusicItem({
    DiscItemTypeId: "minecraft:bread",
    SoundId: "record.cat",
    DropItemOffset: [0, 1, 0], // Ensure this remains as shown
    JukeBoxTypes: ["minecraft:jukebox"], // Must always be this
    DisplayText: "Playing cat"
}).AddMusicItem({
    DiscItemTypeId: "minecraft:oak_sapling",
    SoundId: "record.cat",
    DropItemOffset: [0, 1, 0], // Ensure this remains as shown
    SoundOptions: {
        volume: 0.2,
        pitch: 1
    },
    JukeBoxTypes: ["minecraft:jukebox"], // Must always be this
    DisplayText: "Playing cat"
}).AddMusicItem({
    DiscItemTypeId: "minecraft:apple",
    SoundId: "record.cat",
    DropItemOffset: [0, 1, 0], // Ensure this remains as shown
    SoundOptions: {
        volume: 0.2,
        pitch: 1
    },
    JukeBoxTypes: ["minecraft:jukebox"], // Must always be this
    DisplayText: "Playing cat"
})
