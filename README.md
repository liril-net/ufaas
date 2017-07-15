# ufaas

> μFaaS - Frontend as a Service.

## Prerequisites

### Dnsmasq

Install [dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html) for dns proxy. Add two lines to `dnsmasq.conf`:

```
address=/.ufaas.me/127.0.0.1
address=/.ucdn.me/127.0.0.1
```

### /etc/resolver

Create two files in `/etc/resolver/`.

1. ucdn.me
```
nameserver 127.0.0.1
```

2. ufaas.me
```
nameserver 127.0.0.1
```

### nginx

Install nginx and listen to port 80. Add two config.

1. ufaas.me.conf
```nginx
server {
    listen 80;
    server_name ~^api(?:\.([^.]+))?.ufaas.me;

    location / {
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_pass http://127.0.0.1:9502;
        proxy_set_header Host $host;
        break;
    }
}

server {
    listen 80;
    server_name zip.ufaas.me;

    access_log /usr/local/etc/nginx/logs/zip.ufaas.me.access.log;
    error_log /usr/local/etc/nginx/logs/zip.ufaas.me.error.log;

    root /path/to/ufaas/cdn/zip;
}

server {
    listen 80;
    server_name unzip.ufaas.me;

    access_log /usr/local/etc/nginx/logs/unzip.ufaas.me.access.log;
    error_log /usr/local/etc/nginx/logs/unzip.ufaas.me.error.log;

    root /path/to/ufaas/cdn/unzip;
}

server {
    listen 80;
    server_name www.ufaas.me;

    access_log /usr/local/etc/nginx/logs/www.ufaas.me.access.log;
    error_log /usr/local/etc/nginx/logs/www.ufaas.me.error.log;

    root /path/to/ufaas/src/frontend/dist;
}

server {
    listen 80;
    server_name dev.ufaas.me;

    location / {
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_pass http://127.0.0.1:9402;
        proxy_set_header Host $host;
        break;
    }
}
```

2. ucdn.me.conf

```nginx
server {
    listen 80;

    access_log /usr/local/etc/nginx/logs/*.ucdn.me.access.log;
    error_log /usr/local/etc/nginx/logs/*.ucdn.me.error.log;
    server_name ~^([^.]+)(?:\.([^.]+))?\.ucdn\.me$;

    set $project $1;
    set $envName $2;

    add_header Cache-Control no-cache;
    set $root /path/to/ufaas/cdn/projects/$project/production;

    if ($envName) {
        set $root /path/to/ufaas/cdn/projects/$project/$envName;
    }

    root $root;

    index index.html;
}

```

## Development

```shell
$ yarn
$ yarn dev
# Visit www.ufaas.me
```

## Production

```shell
$ yarn build
```

## License
MIT
