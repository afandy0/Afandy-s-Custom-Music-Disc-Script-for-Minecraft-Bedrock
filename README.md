# Afandy's Custom Music Disc Addon for Minecraft Bedrock

Afandy's Custom Music Disc Addon allows you to create and play custom music discs in Minecraft Bedrock Edition.

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute this code as you wish!

## Features

- Create custom music discs using any item.
- Define which blocks can play your music discs (currently limited to jukebox).
- Control sound properties such as volume and pitch.
- Display messages when music is played.


## Installation

### 1. Add the Script to Your Addon

Instead of downloading the entire addon, you can easily integrate the script into your own Minecraft Bedrock addon. 

- Copy the code from the `main.js` file in this repository.
- Paste it into your own `main.js` file within the scripts folder of your addon.

### 2. Edit Your Behavior Pack Manifest

In your `manifest.json` file (located in the behavior pack folder), make sure to update the `@minecraft/server` version to either `1.15.0` (for stability) or `1.16.0-beta` (for the latest beta features).

- **Recommended**: Set the version to `1.15.0` as the script was devloped on this version, and should remain stable throughout future minecraft updates.
- **Optional**: if you are useing a difrent version already it will likely still work as most versions are compatible with the script but it's recommended to check anyway.

**Example:**
```json
"dependencies": [
    {
        "uuid": "b80ee5c1-a01f-4841-acd3-99e96b172b23",
        "version": [
            1,
            0,
            79
        ]
    },
    {
        "module_name": "@minecraft/server",
        "version": "1.15.0"
    }
]
```

## Usage

### Adding Custom Music Discs

You can define your custom music discs by using the `AddMusicItem` method in the `main.js` file. Here’s how:

1. Open `main.js` in a code editor.
2. Use the `AddMusicItem` method to add new music discs. Each music disc requires several properties:

   - `DiscItemTypeId`: The item ID you want to use as a music disc.
   - `SoundId`: The sound that will play when the disc is used.
   - `DropItemOffset`: **This must be defined as shown in the example below to ensure the disc drops correctly when returned.**
   - `JukeBoxTypes`: **Always set this to `["minecraft:jukebox"]`.** This is necessary due to a bug that occurs when trying to break a non-vanilla jukebox.
   - `DisplayText`: A message displayed to the player when the music is played.

   **Example:**

   ```javascript
   CustomMusicFunction.AddMusicItem({
       DiscItemTypeId: "minecraft:diamond",
       SoundId: "record.13",
       DropItemOffset: [0, 1, 0], // Ensure this remains as shown
       JukeBoxTypes: ["minecraft:jukebox"], // Must always be this
       DisplayText: "Playing 13"
   });


## Contributing

If you’d like to contribute to this project, feel free to submit a pull request or report issues. Contributions are welcome!

## Support

If you have questions or need help, please create an issue in this repository. I’ll do my best to assist you!
