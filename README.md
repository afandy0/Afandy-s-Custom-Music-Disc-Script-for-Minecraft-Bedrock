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

1. **Download the Addon:**
   Clone or download this repository to your local machine.

   ```bash
   git clone https://github.com/afandy0/custom-music-disc-addon.git

2. Add the Script: Place the main.js file in the appropriate directory of your Minecraft Bedrock addon.

3. Edit the manifest.json: Ensure your manifest.json is set up correctly to include this script.

4. Load the Addon in Minecraft: Launch Minecraft and navigate to the settings to activate your addon.


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

### Interacting with Music Discs

- To play music, **do not sneak** while right-clicking on a jukebox with your custom disc. The script is designed to ignore disc dropping if the player is sneaking, preventing potential duplication of the disc.
- To break a jukebox while music is playing, simply break the block, and the disc will drop.

## Contributing

If you’d like to contribute to this project, feel free to submit a pull request or report issues. Contributions are welcome!

## Support

If you have questions or need help, please create an issue in this repository. We’ll do our best to assist you!

## Acknowledgments

Thanks to the Minecraft community for the continued support and inspiration! Enjoy creating your custom music experiences!
