#!/bin/bash
sudo rsync -rciv src/ /var/tmp/portage/games-arcade/TAsteroids-9999/work/TAsteroids-9999/src
sudo chown -R :portage /var/tmp/portage/games-arcade/TAsteroids-9999/work
sudo -u portage rm /var/tmp/portage/games-arcade/TAsteroids-9999/.compiled
if [[ "$1" -ne "" ]];then
    g.c -m...
fi
env FEATURES=noclean sudo ebuild portage/games-arcade/TAsteroids/TAsteroids-9999.ebuild $1 compile \
&& sudo -u portage cp /var/tmp/portage/games-arcade/TAsteroids-9999/work/TAsteroids-9999/tasteroids /tmp/ \
&& sudo chown :testing2 /tmp/tasteroids \
&& sudo -u portage chmod g+x /tmp/tasteroids \
&& saau testing2 /tmp/tasteroids
