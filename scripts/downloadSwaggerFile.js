require('dotenv').config({
	path: require('path').resolve(__dirname, '../.env.local'),
})

const https = require('https')
const fs = require('fs')
const path = require('path')

// Read the credentials from environment variables
const username = process.env.SWAGGER_USER
const password = process.env.SWAGGER_PASS

// The URL to your protected Swagger file
const swaggerUrl = 'https://api.reservekit.io/v1/swagger/doc.json'

// Where to save the downloaded file
const localSwaggerPath = path.join(__dirname, '..', 'openapi', 'swagger.json')

function downloadSwaggerFile() {
	// Prepare the Basic Auth header
	const options = {
		headers: {
			Authorization:
				'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
		},
	}

	https
		.get(swaggerUrl, options, res => {
			if (res.statusCode !== 200) {
				console.error(
					`Failed to download Swagger file. Status code: ${res.statusCode}`,
				)
				process.exit(1)
			}

			const fileStream = fs.createWriteStream(localSwaggerPath)
			res.pipe(fileStream)

			fileStream.on('finish', () => {
				fileStream.close()
				console.log(`Swagger file downloaded to: ${localSwaggerPath}`)
			})
		})
		.on('error', err => {
			console.error(`Error fetching Swagger file: ${err.message}`)
			process.exit(1)
		})
}

downloadSwaggerFile()
