<div data-custom-code="vue">




<div><script src="https://unpkg.com/vue@3.2.20/dist/vue.global.js"></script>



<style>
#app-body {
  padding-bottom: 2rem;
}

.spacer {
  height: 20px;
}

.basic-difference {
  color: #5cb85c !important;
}

.difference {
  color: red !important;
}

@media screen and (min-width: 800px) {
  #app-body th, #app-body td {
    width: 400px
  }
}

#app-body .inputs-section {
  padding-top: 2.5rem;
  padding-bottom: 0;
}

#app-body .amounts {
  height: 2.5rem;
  font-size: 1.1rem;
  padding-left: 10px;
  padding-right: 2rem;
  margin-right: 3rem;
}

#app-body .col-md-12 {
  padding: 0;
}

#app-body label {
  font-size: 1.286rem;
}

#app-body .input-group {
  padding-bottom: 1rem;
}

#app-body .pt-1 {
  padding-top: 1rem;
}


</style>


<div id="app-body">
<div class="container-fluid">

    <div class="row">
      <div class="col-md-8 inputs-section">

        <form class="form-inline">
          <div class="form-group">
            <label for="UOP">Roczny przychód brutto (UoP): </label><br/>
            <div class="input-group pt-1">
              <div class="input-group-addon">PLN</div>
              <input id="UOP" class="amounts" type="text" v-model="UOP" placeholder="roczny przychód brutto"
                     min="0">
            </div>
          </div>
          <div class="form-group">
            <label for="UOP">Roczny dochód (B2B): </label><br/>
            <div class="input-group pt-1">
              <div class="input-group-addon">PLN</div>
              <input id="B2B" class="amounts" type="text" v-model="B2B" placeholder="roczny dochód" min="0">
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <table class="table">
          <tr>
            <th>2021</th>
            <th>Roczne wynagrodzenie netto</th>
            <th style="border: 0"></th>
          </tr>
          <tr>
            <td>Umowa o pracę</td>
            <td>{{ obliczUmowa2021() }}</td>
            <td style="border: 0"></td>
          </tr>
          <tr>
            <td>Działalność gospodarcza</td>
            <td>{{ obliczB2B2021() }}</td>
            <td style="border: 0"></td>
          </tr>
        </table>

        <div class="spacer"></div>

        <table class="table">
          <tr>
            <th>2022</th>
            <th>Roczne wynagrodzenie netto</th>
            <th>Różnica</th>
          </tr>
          <tr>
            <td>Umowa o pracę</td>
            <td>{{ obliczUmowa2022() }}</td>
            <td class="basic-difference" v-bind:class="{'difference' : this.roznicaUOP < 0 }"
                style="font-weight: bold">
              {{ differenceUmowa() }}
            </td>
          </tr>
          <tr>
            <td>Działalność gospodarcza</td>
            <td>{{ calculateDzialalnosc2022() }}</td>
            <td class="basic-difference" v-bind:class="{'difference' : this.roznicaB2B < 0 }"
                style="font-weight: bold">
              {{ differenceDzialalnosc() }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</div>

<script>

	const app = Vue.createApp({
   data() {
    return {
      UOP: null,
      B2B: null,
      roznicaUOP: 0,
      roznicaB2B: 0
    }
  },
  methods: {
    obliczUmowa2021() {
      if (this.UOP === null) {
        return
      }
      if (this.UOP < 36000) {
        return "przychód poniżej minimum";
      }
      //zmienna wyniku koncowego
      let dochodNettoPracownika = 0;


      //zmienne z tabeli
      let kosztUzyskaniaPrzychodu = 0;
      let dochodPodatkowalny = 0;
      let ubezpieczeniePracownik = 0;
      let ubezpieczeniePracodawca = 0;
      let ubezpieczenieZdrowotne1 = 0;
      let ubezpieczenieZdrowotne2 = 0;
      let dochodPodmiotu = 0;
      let podstawaPodatkowa = 0;
      let podatekBezGory = 0;
      let podatekBezZdrowotnego = 0;
      let kosztPracownika = 0;
      let kosztPracodawcy = 0;


      // zmienne nie nalezace do tabeli
      let kwotaWolnaOdPodatku = 0;
      let ponizej8000 = 0;
      let od8do13 = 0;
      let od13do85 = 0;
      let od85do127 = 0;


      if (+this.UOP !== 0) {
        kosztUzyskaniaPrzychodu = 3000;
      } else {
        kosztUzyskaniaPrzychodu = 0;
      }

      dochodPodatkowalny = +this.UOP - kosztUzyskaniaPrzychodu;

      if (+this.UOP > 157770) {
        ubezpieczeniePracownik = this.myRound(157770 * 0.1371 + 0.0245 * (+this.UOP - 157770));
      } else {
        ubezpieczeniePracownik = this.myRound(+this.UOP * 0.1371);
      }

      if (+this.UOP > 157770) {
        ubezpieczeniePracodawca = this.myRound(157770 * 0.2038 + 0.0412 * (+this.UOP - 157770));
      } else {
        ubezpieczeniePracodawca = this.myRound(+this.UOP * 0.2038);
      }

      ubezpieczenieZdrowotne1 = this.myRound((+this.UOP - ubezpieczeniePracownik) * 0.09);

      ubezpieczenieZdrowotne2 = this.myRound((+this.UOP - ubezpieczeniePracownik) * 0.0775);

      dochodPodmiotu = dochodPodatkowalny;

      podstawaPodatkowa = Math.round(dochodPodmiotu - ubezpieczeniePracownik);

      //obliczamy podatek free UOP (nie nalezy do tabeli)
      ponizej8000 = 1360;
      od8do13 = ponizej8000 - (834.88 * (podstawaPodatkowa - 8000) / 5000);
      od13do85 = 525.12;
      od85do127 = 525.12 - (525.12 * (podstawaPodatkowa - 85528) / 41472);

      if (podstawaPodatkowa <= 8000) {
        kwotaWolnaOdPodatku = ponizej8000;
      } else if (podstawaPodatkowa <= 13000) {
        kwotaWolnaOdPodatku = od8do13;
      } else if (podstawaPodatkowa <= 85528) {
        kwotaWolnaOdPodatku = od13do85;
      } else if (podstawaPodatkowa <= 127000) {
        kwotaWolnaOdPodatku = od85do127;
      } else {
        kwotaWolnaOdPodatku = 0;
      }
      // koniec obliczenia zmiennej nie nalezacej do tabeli

      if (podstawaPodatkowa > 85528) {
        podatekBezGory = this.myRound(85528 * 0.17 + (podstawaPodatkowa - 85528) * 0.32 - kwotaWolnaOdPodatku)
      } else {
        podatekBezGory = this.myRound(0.17 * podstawaPodatkowa - kwotaWolnaOdPodatku)
      }

      podatekBezZdrowotnego = Math.round(podatekBezGory - ubezpieczenieZdrowotne2);
      kosztPracownika = ubezpieczeniePracownik + ubezpieczenieZdrowotne1 + podatekBezZdrowotnego;

      kosztPracodawcy = ubezpieczeniePracodawca;

      dochodNettoPracownika = Math.round(+this.UOP - ubezpieczeniePracownik - ubezpieczenieZdrowotne1 - podatekBezZdrowotnego);

      return dochodNettoPracownika + " zł";
    },
    obliczB2B2021() {
      if (this.B2B === null) {
        return
      }
      let dochodNetto = 0;

      let ubezpieczenie = 0;
      let podstawaPodatkowa = 0;
      let podatek = 0;
      let ubezpieczenieZdrowotne2 = 0;
      let ubezpieczenieZdrowotne1 = 0;
      let podatekDoZaplacenia = 0;
      let kosztPracownika = 0;

      ubezpieczenie = 1075.68 * 12;
      if ((+this.B2B - ubezpieczenie) > 0) {
        podstawaPodatkowa = Math.round(+this.B2B - ubezpieczenie);
      } else {
        podstawaPodatkowa = 0;
      }

      podatek = Math.round(podstawaPodatkowa * 0.19);

      if (+this.B2B > 0) {
        ubezpieczenieZdrowotne1 = 381.81 * 12;
      } else {
        ubezpieczenieZdrowotne1 = 0;
      }

      if (+this.B2B > 0) {
        ubezpieczenieZdrowotne2 = 328.78 * 12;
      } else {
        ubezpieczenieZdrowotne2 = 0;
      }

      if (podatek - ubezpieczenieZdrowotne2 > 0) {
        podatekDoZaplacenia = Math.round(podatek - ubezpieczenieZdrowotne2);
      } else {
        podatekDoZaplacenia = 0;
      }

      kosztPracownika = ubezpieczenie + ubezpieczenieZdrowotne1 + podatekDoZaplacenia;

      dochodNetto = Math.round(+this.B2B - kosztPracownika);

      return dochodNetto + " zł";
    },
    obliczUmowa2022() {
      if (this.UOP === null) {
        return
      }
      if (this.UOP < 36000) {
        return "przychód poniżej minimum";
      }
      //zmienna wyniku koncowego
      let dochodNettoPracownika = 0;


      //zmienne z tabeli
      let kosztUzyskaniaPrzychodu = 0;
      let dochodPodatkowalny = 0;
      let ubezpieczeniePracownik = 0;
      let ubezpieczeniePracodawca = 0;
      let ubezpieczenieZdrowotne1 = 0;
      let ubezpieczenieZdrowotne2 = 0;
      let dochodPodmiotu = 0;
      let podstawaPodatkowa = 0;
      let podatekBezGory = 0;
      let podatekBezZdrowotnego = 0;
      let kosztPracownika = 0;
      let kosztPracodawcy = 0;
      let nowaUlgaPodatkowa = 0;
      let przychod1 = 0;
      let przychod2 = 0;

      if (+this.UOP !== 0) {
        kosztUzyskaniaPrzychodu = 3000;
      } else {
        kosztUzyskaniaPrzychodu = 0;
      }

      przychod1 = (+this.UOP * 0.0668 - 4566) / 0.17;

      przychod2 = (+this.UOP * (-0.0735) + 9829) / 0.17;

      if (+this.UOP < 68412) {
        nowaUlgaPodatkowa = 0;
      } else if (+this.UOP <= 102588) {
        nowaUlgaPodatkowa = przychod1;
      } else if (+this.UOP <= 133692) {
        nowaUlgaPodatkowa = przychod2;
      } else {
        nowaUlgaPodatkowa = 0;
      }

      dochodPodatkowalny = +this.UOP - (kosztUzyskaniaPrzychodu + nowaUlgaPodatkowa);

      if (+this.UOP > 157770) {
        ubezpieczeniePracownik = this.myRound(157770 * 0.1371 + 0.0245 * (+this.UOP - 157770));
      } else {
        ubezpieczeniePracownik = this.myRound(+this.UOP * 0.1371);
      }

      if (+this.UOP > 157770) {
        ubezpieczeniePracodawca = this.myRound(157770 * 0.2038 + 0.0412 * (+this.UOP - 157770));
      } else {
        ubezpieczeniePracodawca = this.myRound(+this.UOP * 0.2038);
      }

      ubezpieczenieZdrowotne1 = this.myRound((+this.UOP - ubezpieczeniePracownik) * 0.09);

      dochodPodmiotu = dochodPodatkowalny;

      podstawaPodatkowa = Math.round(dochodPodmiotu - ubezpieczeniePracownik);

      if (podstawaPodatkowa <= 30000) {
        podatekBezGory = 0;
      } else if (podstawaPodatkowa > 30000 && podstawaPodatkowa <= 120000) {
        podatekBezGory = this.myRound(podstawaPodatkowa * 0.17 - 5100);
      } else {
        podatekBezGory = this.myRound((podstawaPodatkowa - 120000) * 0.32 + 15300);
      }

      podatekBezZdrowotnego = Math.round(podatekBezGory - ubezpieczenieZdrowotne2);

      kosztPracownika = ubezpieczeniePracownik + ubezpieczenieZdrowotne1 + podatekBezZdrowotnego;

      kosztPracodawcy = ubezpieczeniePracodawca;

      dochodNettoPracownika = Math.round(+this.UOP - ubezpieczeniePracownik - ubezpieczenieZdrowotne1 - podatekBezZdrowotnego);

      return dochodNettoPracownika + " zł";
    },
    calculateDzialalnosc2022() {
      if (this.B2B === null) {
        return
      }

      let dochodNetto = 0;

      let ubezpieczenie = 0;
      let podstawaPodatkowa = 0;
      let podatek = 0;
      let ubezpieczenieZdrowotne2 = 0;
      let ubezpieczenieZdrowotne1 = 0;
      let podatekDoZaplacenia = 0;
      let kosztPracownika = 0;

      let healthInsuranceBasis = 0;

      ubezpieczenie = 1075.68 * 12;
      if ((+this.B2B - ubezpieczenie) > 0) {
        podstawaPodatkowa = Math.round(+this.B2B - ubezpieczenie);
      } else {
        podstawaPodatkowa = 0;
      }

      podatek = Math.round(podstawaPodatkowa * 0.19);

      if ((+this.B2B - ubezpieczenie) >= 3000 * 12) {
        healthInsuranceBasis = +this.B2B - ubezpieczenie;
        ubezpieczenieZdrowotne1 = healthInsuranceBasis * 0.049;
      } else {
        healthInsuranceBasis = 3000 * 12;
        ubezpieczenieZdrowotne1 = healthInsuranceBasis * 0.09;
      }

      ubezpieczenieZdrowotne2 = 0;

      if ((podatek - ubezpieczenieZdrowotne2) > 0) {
        podatekDoZaplacenia = Math.round(podatek - ubezpieczenieZdrowotne2);
      } else {
        podatekDoZaplacenia = 0;
      }

      kosztPracownika = ubezpieczenie + ubezpieczenieZdrowotne1 + podatekDoZaplacenia;

      dochodNetto = Math.round(+this.B2B - kosztPracownika);

      return dochodNetto + " zł";

    },
    myRound(num) {
      return Math.round(num * 100) / 100;
    },
    differenceDzialalnosc() {
      if (this.B2B === null) {
        return
      }
      this.roznicaB2B = this.calculateDzialalnosc2022().substr(0, this.calculateDzialalnosc2022().length - 3) - this.obliczB2B2021().substr(0, this.obliczB2B2021().length - 3)
      return (this.roznicaB2B) + " zł";
    },
    differenceUmowa() {
      if (this.UOP === null) {
        return
      }
      let amountUmowa2022 = this.obliczUmowa2022().substr(0, this.obliczUmowa2022().length - 3);
      let amountUmowa2021 = this.obliczUmowa2021().substr(0, this.obliczUmowa2021().length - 3)

      if (!isNaN(amountUmowa2022 - amountUmowa2021)) {
        this.roznicaUOP = amountUmowa2022 - amountUmowa2021;
      } else {
        return "";
      }
      return (this.roznicaUOP) + " zł";
    }
  }

});

app.mount('#app-body')
</script>
</div>




</div>
