import fetch from 'isomorphic-unfetch';
import cookie from 'js-cookie';
import getConfig from 'next/config';
import Router from 'next/router';
import { isUrl, updateQueryStringParameter } from 'src/lib/utils';
export const  Baseurl = process.env.NEXT_PUBLIC_API_ENDPOINT || "https://api.girls2dream.com/v1";
export abstract class APIRequest {
  static token: string = '';

  // static API_ENDPOINT: string = null;
  static API_ENDPOINT: string = process.env.NEXT_PUBLIC_API_ENDPOINT || "https://api.girls2dream.com/v1"; 
  setAuthHeaderToken(token) {
    APIRequest.token = token;
  }

  /**
   * Parses the JSON returned by a network request
   *
   * @param  {object} response A response from a network request
   *
   * @return {object}          The parsed JSON from the request
   */
  private parseJSON(response: Response) {
    if (response.status === 204 || response.status === 205) {
      return null;
    }
    return response.json();
  }

  /**
   * Checks if a network request came back fine, and throws an error if not
   *
   * @param  {object} response   A response from a network request
   *
   * @return {object|undefined} Returns either the response, or throws an error
   */
  private checkStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        Router.push('/auth/login');
      }

      // throw new Error('Forbidden in the action!');
    }

    // const error = new Error(response.statusText) as any;
    // error.response = response;
    // throw error;
    throw response.clone().json();
  }

  getBaseApiEndpoint() {
    const { API_ENDPOINT } = APIRequest;
    if (API_ENDPOINT) return API_ENDPOINT;

    const { publicRuntimeConfig } = getConfig();
    return publicRuntimeConfig.API_ENDPOINT;
  }

  request(url: string, method?: string, body?: any, headers?: { [key: string]: string }) {
    const verb = (method || 'get').toUpperCase();
    const token = APIRequest.token || cookie.get('accessToken') || undefined;
    const updatedHeader = {
      'Content-Type': 'application/json',
      // TODO - check me
      Authorization: token ? `Bearer ${token}` : undefined,
      ...headers || {}
    };
    const baseApiEndpoint = this.getBaseApiEndpoint();
    return fetch(isUrl(url) ? url : `${baseApiEndpoint}${url}`, {
      method: verb,
      headers: updatedHeader,
      body: body ? JSON.stringify(body) : null
    })
      .then(this.checkStatus)
      .then(this.parseJSON);
  }

  rawRequest(url: string, method?: string, body?: any, headers?: { [key: string]: string }) {
    const verb = (method || 'get').toUpperCase();
    const updatedHeader = {
      Authorization: typeof window !== 'undefined' ? `Bearer ${cookie.get('accessToken')}` : '',
      ...headers || {}
    };
    const baseApiEndpoint = this.getBaseApiEndpoint();
    return fetch(isUrl(url) ? url : `${baseApiEndpoint}${url}`, {
      method: verb,
      headers: updatedHeader,
      body
    })
      .then(this.checkStatus)
      .then(this.parseJSON);
  }

  get(url: string, query?: { [key: string]: string }, headers?: { [key: string]: string }) {
    let newUrl = url;
    if (query) {
      Object.keys(query).filter((q) => ![null, undefined, ''].includes(query[q])).forEach((k) => {
        newUrl = updateQueryStringParameter(newUrl, k, query[k]);
      });
    }
    return this.request(newUrl, 'get', null, headers);
  }

  post(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'post', data, headers);
  }

  put(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'put', data, headers);
  }

  del(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'delete', data, headers);
  }
}
