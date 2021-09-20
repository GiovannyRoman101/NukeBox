import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const youtube_key = process.env.youtube_api;
import discord from 'discord.js';
import ytdl from 'ytdl-core';
import fetch from 'node-fetch';
const colors = require('../Utils/colors.json');
import { decode } from 'html-entities';
import ytldDiscord from 'ytdl-core-discord';

export async function run(client, message, args) {
  console.log(args);
  message.channel.bulkDelete(1);
  if (!args[0]) {
    let s = await message.channel
      .send('Please add keyword to search or URL for video.')
      .catch((err) => console.error(err));
    setTimeout(() => {
      s.delete();
    }, 5000);
    return;
  }

  let validate = ytdl.validateURL(args[0]);
  let search = args;
  let youtube_url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${search}&type=video&key=${youtube_key}`;

  const response = await fetch(youtube_url);
  const dataAPI = await response.json();
  const video = dataAPI.items[0];
  const video_url = `https://www.youtube.com/watch?v=${video.id.videoId}`;
  const snippet = video.snippet;

  console.log(video_url);

  if (!validate) {
    playSong(video_url);
  } else if (validate) {
    playSong(args[0]);
  }

  async function playSong(video) {
    try {
      if (!message.guild) return;
      const connection = await message.member.voice.channel.join();
      if (message.member.voice.channel) {
        connection.play(await ytldDiscord(video), { type: 'opus' });

        let streamEmbed = new discord.MessageEmbed()
          .setTitle(`Now Streaming`)
          .setColor(colors.red)
          .setThumbnail(snippet.thumbnails.default.url)
          .setDescription(decode(snippet.title))
          .setTimestamp()
          .setFooter(
            `Sent by ${message.author.username}`,
            message.author.displayAvatarURL()
          );
        message.channel.send(streamEmbed);
      }
    } catch (e) {
      console.log(e);
      let s = await message.channel.send(
        'You need to join a voice channel first!'
      );
      setTimeout(() => {
        s.delete();
      }, 5000);
    }
  }
}
