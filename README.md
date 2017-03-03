# Module: Transmission Stats
This is a module for MagicMirror, intended to show the current transfer statistics from Transmission Servers.

## Installing the module
Clone this repository in your `~/MagicMirror/modules/` folder `( $ cd ~MagicMirror/modules/ )`:
````javascript
git clone https://github.com/s-cotton/MMM-Transmission-Stats.git
````

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
{
    module: 'MMM-Transmission-Stats',
    position: 'bottom_left',
    header: 'Transmission Statistics',
    config: {
        servers : [
        	{ host: "localhost", port: "9091", username: "", password: "", serverLabel: "Server", serverIcon:  "server" },
        	{ host: "192.168.1.1", port: "9091", username: "", password: "", serverLabel: "Server 2", serverIcon:  "archive" },
        ],
        updateInterval: 5000,
        showCumulative: false
    }
},
]
````

## Configuration options

The following properties can be configured:

<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
    <tr>
			<td><code>servers</code></td>
			<td>One or more Server Connection configurations containing "host", "port", "username", "password", "serverLabel" and "serverIcon"<br> At least one server configuration is <b>REQUIRED</b></td>
		</tr>
		<tr>
			<td><code>updateInterval</code></td>
			<td>How long between data calls to the servers. Default value is 5 seconds (5000)</td>
		</tr>
		<tr>
			<td><code>showCumulative</code></td>
			<td>Should cumulative totals be displayed, boolean "true" or "false"</td>
		</tr>
		<tr>
			<td><code>showTotals</code></td>
			<td>Should totals across all servers be displayed, boolean "true" or "false"</td>
		</tr>
	</tbody>
</table>
