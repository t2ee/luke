require('source-map-support/register');
require('app-module-path/register');
import {
    RemoteService,
    RemoteMethod,
} from 'decorator';
import RemoteServer from 'server';
import RemoteClient from 'client';

export {
    RemoteServer,
    RemoteClient,
    RemoteService,
    RemoteMethod,
};
