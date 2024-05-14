## Installing Node V14 on Apple silcon may require some additional steps


### Install Rosetta v2
```
/usr/sbin/softwareupdate --install-rosetta --agree-to-license
```


### Run the following command
```
arch -x86_64 zsh
```


### Make sure you have nvm already, and install v14
```
nvm install 14
```
