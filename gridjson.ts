import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let refjson: any[] = []
for (let i = 0; i < 4; i++) {
  refjson.push(
    await fs.readFile(
      path.join(__dirname, 'produced', `r${i + 1}c2.json`),
      'utf8'
    )
  )
}

// let maxjson = await fs.readFile(
//   path.join(__dirname, 'produced', 'r4c4.json'),
//   'utf8'
// )
// let minjson = await fs.readFile(
//   path.join(__dirname, 'produced', 'r1c1.json'),
//   'utf8'
// )
// let max = JSON.parse(maxjson)
// let min = JSON.parse(minjson)

// function intermediatValues(a: number, b: number, count: number) {
//   let result: number[] = []
//   for (let i = 0; i < count; i++) {
//     result.push(a + ((b - a) * i) / (count - 1))
//   }
//   return result
// }

// console.log(intermediatValues(1,12,4));
function copyProperties(srcJSON: any, destJSON: any) {
  for (let key in srcJSON) {
    if (srcJSON.hasOwnProperty(key)) {
      destJSON[key] = srcJSON[key]
    }
  }
}

// let tmpJSON = { ...min}
const petales = [1, 5, 7, 12]

for (let i = 0; i < refjson.length; i++) {
  for (let j = 0; j < refjson.length; j++) {
    if (j == 1) continue
    let tmpJSON = JSON.parse(refjson[i])
    tmpJSON.Pétales.controllers.k = petales[j]
    tmpJSON.Sépales.controllers.k = petales[j]
    let filename = `r${i + 1}c${j + 1}.json`
    await fs.writeFile(
      path.join(__dirname, 'produced', filename),
      JSON.stringify(tmpJSON)
    )
  }
}

// for (let i = 0; i < petales.length; i++) {
//   for (let j = 0; j < petales.length; j++) {
//     if (!((i == 0 && j == 0) || (i == 3 && j == 3))) {
//       let tmpJSON = { ...min }
//       tmpJSON.Pétales.controllers.a = intermediatValues(
//         min.Pétales.controllers.a,
//         max.Pétales.controllers.a,
//         4
//       )[i]
//       tmpJSON.Pétales.controllers.b = intermediatValues(
//         min.Pétales.controllers.b,
//         max.Pétales.controllers.b,
//         4
//       )[i]
//       tmpJSON.Pétales.controllers.c = intermediatValues(
//         min.Pétales.controllers.c,
//         max.Pétales.controllers.c,
//         4
//       )[i]
//       tmpJSON.Pétales.controllers.d = intermediatValues(
//         min.Pétales.controllers.d,
//         max.Pétales.controllers.d,
//         4
//       )[i]
//       tmpJSON.Pétales.controllers.k = petales[j]
//       tmpJSON.Sépales.controllers.a = intermediatValues(
//         min.Sépales.controllers.a,
//         max.Sépales.controllers.a,
//         4
//       )[i]
//       tmpJSON.Sépales.controllers.b = intermediatValues(
//         min.Sépales.controllers.b,
//         max.Sépales.controllers.b,
//         4
//       )[i]
//       tmpJSON.Sépales.controllers.c = intermediatValues(
//         min.Sépales.controllers.c,
//         max.Sépales.controllers.c,
//         4
//       )[i]
//       tmpJSON.Sépales.controllers.k = petales[j]

//       let filename = `r${i + 1}c${j + 1}.json`
//       await fs.writeFile(
//         path.join(__dirname, 'produced', filename),
//         JSON.stringify(tmpJSON)
//       )
//     } 
//   }
// }

// // for (let i = 0; i < 4; i++){
// //     for (let j = 0; j < 4; j++){

// // }
