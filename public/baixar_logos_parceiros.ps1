# Baixa as logos de "Instituicoes Parceiras" e "Apoiadores do SACRE" do site
# antigo (projetosacre.org) e ja renomeia no padrao esperado pelo app
# (instituicao_NN_nome.ext / apoio_NN_nome.ext).
#
# Uso: abra o PowerShell nesta pasta e rode:  .\baixar_logos_parceiros.ps1
# As imagens vao direto para .\parceiros (servidas como assets estaticos,
# committadas no git -- ver src/pages/institucional/Parceiros.tsx)

$destino = Join-Path $PSScriptRoot "parceiros"
New-Item -ItemType Directory -Force -Path $destino | Out-Null

$arquivos = @(
    # -- Instituicoes Parceiras --
    @{ Nome = "instituicao_01_cnpq.png";        Url = "https://static.wixstatic.com/media/715989_ae83aca2ce8042e29a7e18aba9fed053~mv2.png" }
    @{ Nome = "instituicao_02_fapesp.png";      Url = "https://static.wixstatic.com/media/715989_285350ff47a94bbcb5394bef51bab708~mv2.png" }
    @{ Nome = "instituicao_03_capes.png";       Url = "https://static.wixstatic.com/media/715989_6126aad37f2846a1bc4a2f9a3d24688b~mv2.png" }
    @{ Nome = "instituicao_04_cepas.png";       Url = "https://static.wixstatic.com/media/715989_1aad70d396af43b3942825494f735254~mv2.png" }
    @{ Nome = "instituicao_05_igc-usp.png";     Url = "https://static.wixstatic.com/media/715989_e2e0969cbd0c415bab1fb63a991552d4~mv2.png" }
    @{ Nome = "instituicao_06_poli-usp.png";    Url = "https://static.wixstatic.com/media/715989_3b521de8ae844f20a0cdbdc8f52f2d20~mv2.png" }
    @{ Nome = "instituicao_07_usp.png";         Url = "https://static.wixstatic.com/media/715989_1eec8fc2024c4c19a8908ba5efda908f~mv2.png" }
    @{ Nome = "instituicao_08_unesp.png";       Url = "https://static.wixstatic.com/media/715989_1dda64f08f764358a405896ede274e24~mv2.png" }
    @{ Nome = "instituicao_09_unicamp.png";     Url = "https://static.wixstatic.com/media/715989_2c33824471a645f4b4b118d58ac20629~mv2.png" }
    @{ Nome = "instituicao_10_unifesp.png";     Url = "https://static.wixstatic.com/media/715989_0be314bcdcd44133b302f74f52247a69~mv2.png" }
    @{ Nome = "instituicao_11_ufscar.png";      Url = "https://static.wixstatic.com/media/715989_337872fbbc2640a192b983e2890b7244~mv2.png" }
    @{ Nome = "instituicao_12_dae-bauru.png";   Url = "https://static.wixstatic.com/media/715989_35e462813218423bbd417f2a2f37f127~mv2.png" }
    @{ Nome = "instituicao_13_sp-aguas.png";    Url = "https://static.wixstatic.com/media/20061a_571cca09efe04bb29d4aa7563cd82dbc~mv2.png" }
    @{ Nome = "instituicao_14_cetesb.png";      Url = "https://static.wixstatic.com/media/715989_31fa04e35f75439c821817d83a45195e~mv2.png" }
    @{ Nome = "instituicao_15_semil.png";       Url = "https://static.wixstatic.com/media/715989_d3cff35f19734e8d989b98e20ee63d4a~mv2.png" }
    @{ Nome = "instituicao_16_ipt.png";         Url = "https://static.wixstatic.com/media/715989_80873c8e5087438eb4df584b358160e0~mv2.png" }
    @{ Nome = "instituicao_17_ipa.png";         Url = "https://static.wixstatic.com/media/715989_510102021fdd4f4e8e47a09e8e1e9222~mv2.png" }
    @{ Nome = "instituicao_18_governo-sp.png";  Url = "https://static.wixstatic.com/media/715989_42dfbf9a4ea34683b401e3b0eb1b5553~mv2.png" }
    @{ Nome = "instituicao_19_waterloo.png";    Url = "https://static.wixstatic.com/media/715989_7c63ba0c04db4e0c98c66019274baaa3~mv2.png" }
    @{ Nome = "instituicao_20_canada.png";      Url = "https://static.wixstatic.com/media/715989_de17a500c58347a9ae70886ba8a69f7c~mv2.png" }
    @{ Nome = "instituicao_21_hiroshima.png";   Url = "https://static.wixstatic.com/media/715989_fee5fad76a81440a8eb236a38301a46b~mv2.png" }

    # -- Apoiadores do SACRE --
    @{ Nome = "apoio_01_als.png";               Url = "https://static.wixstatic.com/media/715989_345c8597e9934839bc6f37e2ef20d9a9~mv2.png" }
    @{ Nome = "apoio_02_ellu-ambiental.png";    Url = "https://static.wixstatic.com/media/715989_6229814c11bc43f18c427fc107f07d88~mv2.png" }
    @{ Nome = "apoio_03_hydrolog.png";          Url = "https://static.wixstatic.com/media/715989_aba3ce61a2af44b5b2920210a8f76918~mv2.png" }
    @{ Nome = "apoio_04_apoiador.jpg";          Url = "https://static.wixstatic.com/media/20061a_c48ef3f15b1941b48d3ce767fb3f93ac~mv2.jpg" }
)

foreach ($item in $arquivos) {
    $caminho = Join-Path $destino $item.Nome
    try {
        Invoke-WebRequest -Uri $item.Url -OutFile $caminho -UseBasicParsing
        Write-Host "OK   $($item.Nome)"
    } catch {
        Write-Host "FALHOU $($item.Nome): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Concluido. Arquivos em: $destino"
