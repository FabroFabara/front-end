import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Signos } from 'src/app/_model/signos';
import { SignosService } from 'src/app/_service/signos.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PacienteService } from 'src/app/_service/paciente.service';
import { Paciente } from 'src/app/_model/paciente';
import * as moment from 'moment';

@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css'],
})
export class SignosEdicionComponent implements OnInit {
  pacientes$: Observable<Paciente[]>;
  idPacienteSeleccionado: number;
  maxFecha: Date = new Date();
  fechaSeleccionada: Date = new Date();
  form: FormGroup = new FormGroup({});
  id: number = 0;
  edicion: boolean = false;

  constructor(
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    private signosService: SignosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pacientes$ = this.pacienteService.listar();
    this.form = new FormGroup({
      idSignos: new FormControl(0),
      temperatura: new FormControl(''),
      pulso: new FormControl(''),
      ritmo: new FormControl(''),
    });

    this.route.params.subscribe((data: Params) => {
      this.id = data['idSignos'];
      this.edicion = data['idSignos'] != null;
      this.initForm();
    });
  }

  initForm() {
    if (this.edicion) {
      this.signosService.listarPorId(this.id).subscribe((data) => {
        this.form = new FormGroup({
          idSignos: new FormControl(data.idSignos),
          temperatura: new FormControl(data.temperatura),
          pulso: new FormControl(data.pulso),
          ritmo: new FormControl(data.ritmo),
        });
      });
    }
  }

  operar() {
    let paciente = new Paciente();
    paciente.idPaciente = this.idPacienteSeleccionado;
    let signos = new Signos();
    signos.idSignos = this.form.value['idSignos'];
    signos.temperatura = this.form.value['temperatura'];
    signos.fecha = moment(this.fechaSeleccionada).format('YYYY-MM-DDTHH:mm:ss');
    signos.pulso = this.form.value['pulso'];
    signos.ritmo = this.form.value['ritmo'];
    signos.paciente = paciente;

    if (this.edicion) {
      //PRACTICA NO IDEAL
      //MODIFICAR
      this.signosService.modificar(signos).subscribe(() => {
        this.signosService.listar().subscribe((data) => {
          this.signosService.setSignosCambio(data);
          this.signosService.setMensajeCambio('SE MODIFICO');
        });
      });
    } else {
      //PRACTICA IDEAL
      //REGISTRAR
      this.signosService
        .registrar(signos)
        .pipe(
          switchMap(() => {
            return this.signosService.listar();
          })
        )
        .subscribe((data) => {
          this.signosService.setSignosCambio(data);
          this.signosService.setMensajeCambio('SE REGISTRO');
        });
    }

    this.router.navigate(['/pages/signos']);
  }
}
