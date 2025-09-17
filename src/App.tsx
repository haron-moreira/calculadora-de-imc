import React, { useState, FormEvent } from 'react';
import './App.css';

interface ImcResult {
  valor: number;
  descricao: string;
}

interface ImcResponse {
  imc: number;
  imcDescription: string;
}

interface Intervalo {
  min: number;
  max: number;
  classificacao: string;
}

class Pessoa {
  altura: number;
  peso: number;

  constructor(altura: number, peso: number) {
    if (!altura || !peso) {
      throw new Error("Altura e peso são obrigatórios");
    }

    this.altura = altura;
    this.peso = peso;
  }
}

class Nutricionista extends Pessoa {
  valorImc: number;
  descricaoImc: string;

  constructor(altura: number, peso: number) {
    super(altura, peso);
    this.valorImc = 0;
    this.descricaoImc = "";
  }

  imc = async function (this: Nutricionista): Promise<Nutricionista> {
    const result = await calculaImc(this);
    console.log('----- Nutricionista->imc=> -----');
    console.log(result);
    console.log(this);
    this.valorImc = result.imc;
    this.descricaoImc = result.imcDescription;
    return this;
  };
}

function calculaImc(nutricionista: Nutricionista): Promise<ImcResponse> {
  return fetch("http://localhost:3000/imc/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ height: nutricionista.altura, weight: nutricionista.peso })
  })
    .then((response) => {
      if (response.ok) {
        return response.json() as Promise<ImcResponse>;
      } else {
        throw new Error("Erro ao calcular IMC");
      }
    });
}

function App() {
  const [altura, setAltura] = useState<string>('');
  const [peso, setPeso] = useState<string>('');
  const [imcResult, setImcResult] = useState<ImcResult | null>(null);

  const renderizaTabelaIMC = (imc: number) => {
    const intervalos: Intervalo[] = [
      { min: 0, max: 18.4, classificacao: "Abaixo do peso" },
      { min: 18.4, max: 24.9, classificacao: "Peso normal" },
      { min: 24.9, max: 29.9, classificacao: "Sobrepeso" },
      { min: 29.9, max: Infinity, classificacao: "Obesidade" }
    ];

    return (
      <table id='tabela-imc'>
        <thead>
          <tr>
            <th>Classificação</th>
            <th>IMC</th>
          </tr>
        </thead>
        <tbody>
          {intervalos.map((x, index) => {
            const intervalo = x.min + " - " + x.max;
            const isDestaque = imc >= x.min && imc < x.max;
            return (
              <tr key={index} className={isDestaque ? 'destaque-imc' : ''}>
                <td>{x.classificacao}</td>
                <td>{intervalo}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const handleCalcularIMC = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    try {
      const nutricionista = new Nutricionista(
        parseFloat(altura),
        parseFloat(peso)
      );

      await nutricionista.imc();

      setImcResult({
        valor: nutricionista.valorImc,
        descricao: nutricionista.descricaoImc
      });
    } catch (error) {
      console.error('Erro ao calcular IMC:', error);
      alert('Erro ao calcular IMC. Verifique os valores inseridos.');
    }
  };

  return (
    <div className="container">
      <div className="data">
        <div className="form">
          <form onSubmit={handleCalcularIMC}>
            <div className="row">
              <label>Altura:</label>
              <input
                type="text"
                id="altura"
                placeholder="Digite sua altura (em metros)"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
              />
            </div>
            <div className="row">
              <label>Peso:</label>
              <input
                type="text"
                id="peso"
                placeholder="Digite seu peso (em kg)"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
            </div>
            <div className="row">
              <button type="submit" id="calcular">Calcular IMC</button>
            </div>
          </form>
        </div>
      </div>
      <div className="data">
        <p>
          Seu IMC é <span id="imc">
            {imcResult ? `${imcResult.valor} - ${imcResult.descricao}` : ''}
          </span>
        </p>
        <div id="tabela-imc-container">
          {imcResult && renderizaTabelaIMC(imcResult.valor)}
        </div>
      </div>
    </div>
  );
}

export default App;