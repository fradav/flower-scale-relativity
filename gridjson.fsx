open System.IO
open Newtonsoft.Json

let refjson = 
    [ for i in 0 .. 3 do
        File.ReadAllText(Path.Combine(__dirname, sprintf "produced/r%dc2.json" (i + 1)))
        |> JsonConvert.DeserializeObject ]
        

let petales = [| 1; 5; 7; 12 |]

for i = 0 to refjson.Length - 1 do
    for j = 0 to refjson.Length - 1 do
        if j <> 1 then
            let tmpJSON = refjson.[i]
            tmpJSON?Pétales?controllers?k <- petales.[j]
            tmpJSON?Sépales?controllers?k <- petales.[j]
            let filename = sprintf "r%dc%d.json" (i + 1, j + 1)
            File.WriteAllText(Path.Combine(__dirname, "produced", filename), Newtonsoft.Json.JsonConvert.SerializeObject(tmpJSON))
